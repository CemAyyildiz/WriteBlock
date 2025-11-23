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
import { getBlockchainClient, getWalletClient, initializeSuiWallet, getProviderConfig } from '@/lib/client';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';

export default function AdminPage() {
  const router = useRouter();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [newAuthorAddress, setNewAuthorAddress] = useState('');
  const [newAuthorName, setNewAuthorName] = useState('');
  const [isGranting, setIsGranting] = useState(false);
  const [grantSuccess, setGrantSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');

  // Sui wallet integration
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [adminCapId, setAdminCapId] = useState<string | null>(null);
  const config = getProviderConfig();

  // Fetch authors from blockchain (admin'in transaction history'sinden)
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
          name: `Author ${cap.author.substring(0, 6)}...${cap.author.substring(cap.author.length - 4)}`,
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

  // Initialize Sui wallet connection
  useEffect(() => {
    if (currentAccount) {
      initializeSuiWallet({
        account: currentAccount,
        connect: async () => {},
        disconnect: async () => {},
        signAndExecute: async (tx) => {
          return new Promise((resolve, reject) => {
            signAndExecuteTransaction(
              { transaction: tx },
              {
                onSuccess: (result) => resolve({ digest: result.digest }),
                onError: (error) => reject(error),
              }
            );
          });
        },
      });

      const fetchCapabilities = async () => {
        try {
          const envAdminCapId = process.env.NEXT_PUBLIC_ADMIN_CAP_ID;
          if (envAdminCapId) {
            setAdminCapId(envAdminCapId);
            console.log('✅ Using Admin Capability from .env.local:', envAdminCapId);
            return;
          }
          
          const wallet = getWalletClient();
          const caps = await wallet.getUserCapabilities(currentAccount.address);
          
          if (caps.adminCapId) {
            setAdminCapId(caps.adminCapId);
            console.log('✅ Admin capability found from wallet:', caps.adminCapId);
          } else {
            console.warn('⚠️ No admin capability found. Make sure NEXT_PUBLIC_ADMIN_CAP_ID is set in .env.local');
          }
        } catch (error) {
          console.error('Error fetching capabilities:', error);
        }
      };

      fetchCapabilities();
    }
  }, [currentAccount, signAndExecuteTransaction, config.wallet]);

  const validateAddress = (address: string) => {
    return address.startsWith('0x') && address.length === 66;
  };

  const handleGrantCapability = async () => {
    if (!newAuthorAddress || !newAuthorName) {
      alert('Please fill all fields');
      return;
    }

    if (!validateAddress(newAuthorAddress)) {
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
              name: `Author ${cap.author.substring(0, 6)}...${cap.author.substring(cap.author.length - 4)}`,
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

  const formatAddress = (address: string) => {
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
            formatAddress={formatAddress}
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

          <AuthorsList
            authors={authors}
            formatAddress={formatAddress}
            formatDate={formatDate}
          />
        </div>
      </main>
    </>
  );
}
