'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import RequestForm from '@/components/become-author/RequestForm';
import StatusCard from '@/components/become-author/StatusCard';
import InfoSection from '@/components/become-author/InfoSection';
import LoadingAnimation from '@/components/LoadingAnimation';
import Toast from '@/components/Toast';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useWalletCapabilities } from '@/lib/hooks/useWalletCapabilities';
import { useToast } from '@/lib/hooks/useToast';
import { getStorageClient } from '@/lib/client';
import { AuthorRequest } from '@/types';

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
  console.log('📝 Registry blob ID saved:', blobId);
};

export default function BecomeAuthorPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { authorCapId } = useWalletCapabilities();
  const { toasts, hideToast, success, error } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState<AuthorRequest | null>(null);

  // Check if user already has a pending/approved request
  useEffect(() => {
    const checkExistingRequest = async () => {
      if (!currentAccount?.address) {
        setLoading(false);
        return;
      }

      try {
        const storageClient = getStorageClient();
        
        // Try to fetch the requests registry
        const registryBlobId = getRegistryBlobId();
        
        if (registryBlobId) {
          try {
            const registryContent = await storageClient.download(registryBlobId);
            const registry: AuthorRequest[] = JSON.parse(registryContent);
            
            // Find request for current user
            const userRequest = registry.find(
              req => req.requester.toLowerCase() === currentAccount.address.toLowerCase()
            );
            
            if (userRequest) {
              setExistingRequest(userRequest);
            }
          } catch (err: any) {
            // Registry doesn't exist yet or error fetching - that's okay
            if (!err?.message?.includes('404')) {
              console.warn('Error fetching author requests registry:', err);
            }
          }
        }
      } catch (err) {
        console.error('Error checking existing request:', err);
      } finally {
        setLoading(false);
      }
    };

    checkExistingRequest();
  }, [currentAccount]);

  const handleSubmitRequest = async (data: { name: string; bio: string; reason: string }) => {
    if (!currentAccount?.address) {
      error('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);

    try {
      const storageClient = getStorageClient();
      
      // Fetch existing registry
      let registry: AuthorRequest[] = [];
      const registryBlobId = getRegistryBlobId();
      
      if (registryBlobId) {
        try {
          const registryContent = await storageClient.download(registryBlobId);
          registry = JSON.parse(registryContent);
          
          // Check if user already has a pending/approved request
          const existingUserRequest = registry.find(
            r => r.requester.toLowerCase() === currentAccount.address.toLowerCase()
          );
          
          if (existingUserRequest) {
            if (existingUserRequest.status === 'pending') {
              error('You already have a pending request. Please wait for admin approval.');
              return;
            } else if (existingUserRequest.status === 'approved') {
              error('Your request was already approved! Please refresh the page.');
              return;
            }
          }
        } catch (err: any) {
          console.warn('Could not fetch existing registry:', err);
          // Continue anyway - might be first request
        }
      } else {
        console.log('No registry blob ID found, creating new registry');
      }

      // Create new request
      const newRequest: AuthorRequest = {
        id: `${currentAccount.address}-${Date.now()}`,
        requester: currentAccount.address,
        name: data.name,
        bio: data.bio,
        reason: data.reason,
        status: 'pending',
        createdAt: Date.now(),
      };

      // Add to registry
      registry.push(newRequest);

      // Upload updated registry to Walrus
      const newBlobId = await storageClient.upload(JSON.stringify(registry, null, 2));
      console.log('✅ Author request submitted. New registry blob ID:', newBlobId);

      // Save the new blob ID to localStorage
      saveRegistryBlobId(newBlobId);

      setExistingRequest(newRequest);
      success('Author request submitted successfully! Admin will review your application.');
    } catch (err) {
      console.error('Error submitting author request:', err);
      error('Failed to submit request: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white flex items-center justify-center pt-16 lg:pt-0">
          <LoadingAnimation message="Loading..." size="lg" />
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
              Please connect your Sui wallet to submit an author request.
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

  // If user already has author capability
  if (authorCapId) {
    return (
      <>
        <Sidebar />
        <main className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white flex items-center justify-center pt-16 lg:pt-0">
          <div className="text-center max-w-md px-6">
            <div className="w-20 h-20 bg-green-50 border-2 border-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✍️</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              You're Already an Author!
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              You already have author capabilities. Start creating amazing content!
            </p>
            <button
              onClick={() => router.push('/author')}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Go to Author Dashboard
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
            
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mb-4">
              Become an Author
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
              Request author capabilities to start publishing articles on WriteBlock. 
              Your content will be permanently stored on-chain and verified on the Sui blockchain.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Left Column - Form or Status */}
            <div>
              {existingRequest ? (
                <div className="space-y-6">
                  <StatusCard
                    status={existingRequest.status}
                    submittedAt={existingRequest.createdAt}
                    processedAt={existingRequest.processedAt}
                  />
                  
                  {existingRequest.status === 'rejected' && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        Want to try again?
                      </h3>
                      <button
                        onClick={() => setExistingRequest(null)}
                        className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                      >
                        Submit New Request
                      </button>
                    </div>
                  )}

                  {existingRequest.status === 'approved' && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        Ready to start writing?
                      </h3>
                      <button
                        onClick={() => router.push('/author')}
                        className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                      >
                        Go to Author Dashboard
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                  <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
                    Submit Your Request
                  </h2>
                  <RequestForm
                    requesterAddress={currentAccount.address}
                    onSubmit={handleSubmitRequest}
                    isSubmitting={isSubmitting}
                  />
                </div>
              )}
            </div>

            {/* Right Column - Info */}
            <div>
              <InfoSection />
            </div>
          </div>
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

