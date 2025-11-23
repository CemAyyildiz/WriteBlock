'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminInfoCard from '@/components/admin/AdminInfoCard';
import GrantAuthorForm from '@/components/admin/GrantAuthorForm';
import HowItWorksSection from '@/components/admin/HowItWorksSection';
import SuccessMessage from '@/components/admin/SuccessMessage';
import AuthorsList from '@/components/admin/AuthorsList';
import { Author } from '@/types';
import { getBlockchainClient, getWalletClient, getProviderConfig } from '@/lib/client';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useWalletCapabilities } from '@/lib/hooks/useWalletCapabilities';
import { formatAddress, formatDate, isValidSuiAddress } from '@/lib/utils/format';

export default function AdminPage() {
  const router = useRouter();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [newAuthorAddress, setNewAuthorAddress] = useState('');
  const [newAuthorName, setNewAuthorName] = useState('');
  const [isGranting, setIsGranting] = useState(false);
  const [grantSuccess, setGrantSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');

  const currentAccount = useCurrentAccount();
  const { adminCapId } = useWalletCapabilities();
  const config = getProviderConfig();

  // Fetch authors from blockchain
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const wallet = getWalletClient();
        const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID;
        
        if (!packageId) {
          console.warn('Package ID not configured');
          return;
        }

        console.log('🔍 Fetching authors from admin transaction history...');
        const authorCapabilities = await wallet.getAuthorCapabilities(packageId);
        
        console.log('📋 Found', authorCapabilities.length, 'authors from blockchain');
        
        const authorsData: Author[] = authorCapabilities.map((cap: any) => ({
          address: cap.author,
          name: `Author ${formatAddress(cap.author)}`,
          granted_at: cap.issued_at,
        }));
        
        setAuthors(authorsData);
      } catch (error) {
        console.error('Error fetching authors from blockchain:', error);
      }
    };

    if (adminCapId) {
      fetchAuthors();
    }
  }, [adminCapId]);

  const handleGrantCapability = async () => {
    if (!newAuthorAddress || !newAuthorName) {
      alert('Please fill all fields');
      return;
    }

    if (!isValidSuiAddress(newAuthorAddress)) {
      alert('Invalid Sui address format. Address must start with 0x and be 66 characters long.');
      return;
    }

    if (authors.some(a => a.address.toLowerCase() === newAuthorAddress.toLowerCase())) {
      alert('This address already has author capability');
      return;
    }

    if (config.blockchain === 'sui') {
      if (!currentAccount) {
        alert('Please connect your Sui wallet first');
        return;
      }
      if (!adminCapId) {
        alert('You need Admin capability to grant author permissions. Only the deployer has admin rights.');
        return;
      }
    }

    setIsGranting(true);
    setGrantSuccess(false);

    try {
      const blockchainClient = getBlockchainClient();
      
      const capabilityId = adminCapId!;
      
      const txResult = await blockchainClient.grantAuthorCapability(
        capabilityId,
        newAuthorAddress
      );
      console.log('✅ Author capability granted:', txResult.txHash);
      
      if (!txResult.success) {
        throw new Error(txResult.error || 'Transaction failed');
      }
      
      setTxHash(txResult.txHash);
      setGrantSuccess(true);
      
      setNewAuthorAddress('');
      setNewAuthorName('');
      
      // Refresh author list from blockchain after transaction is confirmed
      setTimeout(async () => {
        try {
          const wallet = getWalletClient();
          const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID;
          
          if (packageId) {
            console.log('🔄 Refreshing author list from blockchain...');
            const authorCapabilities = await wallet.getAuthorCapabilities(packageId);
            const authorsData: Author[] = authorCapabilities.map((cap: any) => ({
              address: cap.author,
              name: `Author ${formatAddress(cap.author)}`,
              granted_at: cap.issued_at,
            }));
            
            setAuthors(authorsData);
            console.log('✅ Author list refreshed:', authorsData.length, 'authors');
          }
        } catch (err) {
          console.error('Error refreshing author list:', err);
        }
        
        setGrantSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Grant error:', error);
      alert('Authorization failed: ' + (error as Error).message);
    } finally {
      setIsGranting(false);
    }
  };

  if (!currentAccount) {
    return (
      <>
        <Sidebar />
        <main className="bg-white pt-16 lg:pt-0">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-12">
            <div className="text-center max-w-md mx-auto py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🔒</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600">
                Please connect your Sui wallet to access the admin panel.
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!adminCapId) {
    return (
      <>
        <Sidebar />
        <main className="bg-white pt-16 lg:pt-0">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-12">
            <div className="text-center max-w-md mx-auto py-20">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Admin Capability Required
              </h2>
              <p className="text-gray-600 mb-6">
                You need Admin capability to manage author permissions. Only the contract deployer has admin rights.
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="bg-white pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-12">
          <AdminHeader />

          <AdminInfoCard
            currentAccount={currentAccount}
            adminCapId={adminCapId}
          />

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <GrantAuthorForm
              newAuthorName={newAuthorName}
              newAuthorAddress={newAuthorAddress}
              isGranting={isGranting}
              onNameChange={setNewAuthorName}
              onAddressChange={setNewAuthorAddress}
              onSubmit={handleGrantCapability}
            />

            <HowItWorksSection />
          </div>

          {grantSuccess && txHash && (
            <SuccessMessage txHash={txHash} />
          )}

          <AuthorsList authors={authors} />
        </div>
      </main>
    </>
  );
}
