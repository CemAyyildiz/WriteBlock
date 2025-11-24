'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import AdminStats from '@/components/admin/AdminStats';
import AuthorRequestsList from '@/components/admin/AuthorRequestsList';
import AuthorsList from '@/components/admin/AuthorsList';
import DirectGrantForm from '@/components/admin/DirectGrantForm';
import LoadingAnimation from '@/components/LoadingAnimation';
import Toast from '@/components/Toast';
import { Author, AuthorRequest } from '@/types';
import { getBlockchainClient, getWalletClient, getStorageClient } from '@/lib/client';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useWalletCapabilities } from '@/lib/hooks/useWalletCapabilities';
import { useToast } from '@/lib/hooks/useToast';
import { formatAddress } from '@/lib/utils/format';

const AUTHOR_REQUESTS_STORAGE_KEY = 'writeblock_author_requests_blob_id';

// Get the current registry blob ID from localStorage
const getRegistryBlobId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTHOR_REQUESTS_STORAGE_KEY);
};

// Save the registry blob ID to localStorage
const saveRegistryBlobId = (blobId: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTHOR_REQUESTS_STORAGE_KEY, blobId);
};

export default function AdminPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { adminCapId } = useWalletCapabilities();
  const { toasts, hideToast, success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorRequests, setAuthorRequests] = useState<AuthorRequest[]>([]);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'authors'>('requests');
  const [isGrantingDirect, setIsGrantingDirect] = useState(false);

  // Fetch authors and requests
  useEffect(() => {
    const fetchData = async () => {
      if (!adminCapId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch authors
        const wallet = getWalletClient();
        const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID;
        
        if (packageId) {
          const authorCapabilities = await wallet.getAuthorCapabilities(packageId);
          const authorsData: Author[] = authorCapabilities.map((cap: any) => ({
            address: cap.author,
            name: `Author ${formatAddress(cap.author)}`,
            granted_at: cap.issued_at,
          }));
          setAuthors(authorsData);
        }

        // Fetch author requests
        const storageClient = getStorageClient();
        const registryBlobId = getRegistryBlobId();
        
        if (registryBlobId) {
          try {
            const registryContent = await storageClient.download(registryBlobId);
            const requests: AuthorRequest[] = JSON.parse(registryContent);
            setAuthorRequests(requests);
          } catch (err: any) {
            // Registry doesn't exist yet - that's okay
            if (!err?.message?.includes('404')) {
              // Silent fail for non-404 errors
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [adminCapId, error]);

  const handleApproveRequest = async (request: AuthorRequest) => {
    if (!adminCapId || !currentAccount) {
      error('Admin capability required');
      return;
    }

    setProcessingRequestId(request.id);

    try {
      const blockchainClient = getBlockchainClient();
      
      // Grant author capability on blockchain
      const txResult = await blockchainClient.grantAuthorCapability(
        adminCapId,
        request.requester
      );

      if (!txResult.success) {
        throw new Error(txResult.error || 'Transaction failed');
      }

      success(`Author capability granted to ${request.name}!`);

      // Update request status in storage
      const updatedRequests = authorRequests.map(r =>
        r.id === request.id
          ? { ...r, status: 'approved' as const, processedAt: Date.now(), processedBy: currentAccount.address }
          : r
      );
      setAuthorRequests(updatedRequests);

      // Upload updated registry
      const storageClient = getStorageClient();
      const newBlobId = await storageClient.upload(JSON.stringify(updatedRequests, null, 2));
      saveRegistryBlobId(newBlobId);

      // Refresh authors list
      setTimeout(async () => {
        const wallet = getWalletClient();
        const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID;
        
        if (packageId) {
          const authorCapabilities = await wallet.getAuthorCapabilities(packageId);
          const authorsData: Author[] = authorCapabilities.map((cap: any) => ({
            address: cap.author,
            name: `Author ${formatAddress(cap.author)}`,
            granted_at: cap.issued_at,
          }));
          setAuthors(authorsData);
        }
      }, 2000);
    } catch (err) {
      console.error('Error approving request:', err);
      error('Failed to approve request: ' + (err as Error).message);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectRequest = async (request: AuthorRequest) => {
    if (!currentAccount) {
      error('Please connect your wallet');
      return;
    }

    setProcessingRequestId(request.id);

    try {
      // Update request status
      const updatedRequests = authorRequests.map(r =>
        r.id === request.id
          ? { ...r, status: 'rejected' as const, processedAt: Date.now(), processedBy: currentAccount.address }
          : r
      );
      setAuthorRequests(updatedRequests);

      // Upload updated registry
      const storageClient = getStorageClient();
      const newBlobId = await storageClient.upload(JSON.stringify(updatedRequests, null, 2));
      saveRegistryBlobId(newBlobId);

      success(`Request from ${request.name} has been rejected.`);
    } catch (err) {
      console.error('Error rejecting request:', err);
      error('Failed to reject request: ' + (err as Error).message);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleDirectGrant = async (address: string, name: string) => {
    if (!adminCapId || !currentAccount) {
      error('Admin capability required');
      return;
    }

    setIsGrantingDirect(true);

    try {
      const blockchainClient = getBlockchainClient();
      
      // Grant author capability on blockchain
      const txResult = await blockchainClient.grantAuthorCapability(
        adminCapId,
        address
      );

      if (!txResult.success) {
        throw new Error(txResult.error || 'Transaction failed');
      }

      success(`Author capability granted to ${name}!`);

      // Refresh authors list
      setTimeout(async () => {
        const wallet = getWalletClient();
        const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID;
        
        if (packageId) {
          const authorCapabilities = await wallet.getAuthorCapabilities(packageId);
          const authorsData: Author[] = authorCapabilities.map((cap: any) => ({
            address: cap.author,
            name: `Author ${formatAddress(cap.author)}`,
            granted_at: cap.issued_at,
          }));
          setAuthors(authorsData);
        }
      }, 2000);
    } catch (err) {
      console.error('Error granting capability:', err);
      error('Failed to grant capability: ' + (err as Error).message);
    } finally {
      setIsGrantingDirect(false);
    }
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white flex items-center justify-center pt-16 lg:pt-0">
          <LoadingAnimation message="Loading admin panel..." size="lg" />
        </div>
      </>
    );
  }

  if (!currentAccount) {
    return (
      <>
        <Sidebar />
        <main className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white flex items-center justify-center pt-16 lg:pt-0">
          <div className="text-center max-w-md px-6">
            <div className="w-20 h-20 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🔒</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Please connect your Sui wallet to access the admin panel.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </main>
      </>
    );
  }

  if (!adminCapId) {
    return (
      <>
        <Sidebar />
        <main className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white flex items-center justify-center pt-16 lg:pt-0">
          <div className="text-center max-w-md px-6">
            <div className="w-20 h-20 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Admin Access Required
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              You need Admin capability to access this page. Only the contract deployer has admin rights.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="bg-gradient-to-b from-gray-50 to-white min-h-screen pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          
          {/* Header */}
          <div className="mb-12">
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 inline-flex items-center gap-2 text-sm mb-6 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
              <span>Back to home</span>
            </button>
            
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900">
                Admin Panel
              </h1>
              <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-xs font-semibold text-blue-800">ADMIN</span>
              </div>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              Manage author requests and permissions for WriteBlock.
            </p>
          </div>

          {/* Stats */}
          <div className="mb-12">
            <AdminStats authors={authors} authorRequests={authorRequests} />
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('requests')}
                className={`pb-4 px-2 font-semibold transition-colors relative ${
                  activeTab === 'requests'
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Author Requests
                {authorRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                    {authorRequests.filter(r => r.status === 'pending').length}
                  </span>
                )}
                {activeTab === 'requests' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('authors')}
                className={`pb-4 px-2 font-semibold transition-colors relative ${
                  activeTab === 'authors'
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Active Authors
                {activeTab === 'authors' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'requests' ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Author Requests - 2 columns */}
              <div className="lg:col-span-2">
                <AuthorRequestsList
                  requests={authorRequests}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                  processing={processingRequestId}
                />
              </div>

              {/* Direct Grant Form - 1 column */}
              <div className="lg:col-span-1">
                <DirectGrantForm
                  onGrant={handleDirectGrant}
                  isGranting={isGrantingDirect}
                  existingAuthors={authors.map(a => a.address)}
                />
              </div>
            </div>
          ) : (
            <AuthorsList authors={authors} />
          )}
        </div>

        {/* Toast Notifications */}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </main>
    </>
  );
}
