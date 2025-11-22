'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Author } from '@/types';
import { getBlockchainClient, getWalletClient, initializeSuiWallet, getProviderConfig } from '@/lib/client';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';

export default function AdminPage() {
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

      // Fetch user capabilities
      const fetchCapabilities = async () => {
        try {
          // First, try to use the Admin Cap ID from environment (new contract)
          // This is the Admin_Capability created during contract deployment
          const envAdminCapId = process.env.NEXT_PUBLIC_ADMIN_CAP_ID;
          if (envAdminCapId) {
            setAdminCapId(envAdminCapId);
            console.log('✅ Using Admin Capability from .env.local:', envAdminCapId);
            return;
          }
          
          // Fallback: Query wallet for capabilities (for older contracts)
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

    // Check for Sui mode requirements
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
      
      const newAuthor: Author = {
        address: newAuthorAddress,
        name: newAuthorName,
        granted_at: Date.now(),
      };
      
      setAuthors([...authors, newAuthor]);
      setTxHash(txResult.txHash);
      setGrantSuccess(true);
      
      setNewAuthorAddress('');
      setNewAuthorName('');
      
      setTimeout(() => setGrantSuccess(false), 5000);
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

  return (
    <div className="min-h-screen bg-off-white dark:bg-navy-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 border border-purple-200 dark:border-purple-700">
            <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></div>
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Admin Access</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-navy-800 to-purple-600 dark:from-navy-200 dark:to-purple-400 bg-clip-text text-transparent">
            Author Management
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            Grant write permissions to trusted addresses
          </p>
        </div>

        {/* Admin Info Card */}
        <div className="glass-card p-6 mb-8 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <span className="text-3xl">👑</span>
              </div>
              <div>
                <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                  Admin Address
                </div>
                <div className="font-mono text-lg font-bold text-navy-700 dark:text-navy-300">
                  {currentAccount
                    ? formatAddress(currentAccount.address)
                    : 'Not connected'
                  }
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                Authority Status
              </div>
              <div className={`font-bold text-lg ${adminCapId ? 'text-purple-700 dark:text-purple-300' : 'text-red-600 dark:text-red-400'}`}>
                {adminCapId ? 'Admin_Capability ✓' : 'No Admin Capability ⚠️'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Grant Form */}
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-navy-50 to-navy-100 dark:from-navy-900 dark:to-navy-800">
              <h2 className="text-2xl font-bold text-navy-800 dark:text-navy-200">
                Add New Author
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Grant Author_Capability permission
              </p>
            </div>

            <div className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-navy-700 dark:text-navy-300 mb-2">
                  Author Name
                </label>
                <input
                  type="text"
                  value={newAuthorName}
                  onChange={(e) => setNewAuthorName(e.target.value)}
                  placeholder="e.g., Alice Writer"
                  className="modern-input"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-700 dark:text-navy-300 mb-2">
                  Sui Wallet Address
                </label>
                <input
                  type="text"
                  value={newAuthorAddress}
                  onChange={(e) => setNewAuthorAddress(e.target.value)}
                  placeholder="0x..."
                  className="modern-input font-mono"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  66 characters long, starting with 0x
                </p>
              </div>

              <button
                onClick={handleGrantCapability}
                disabled={isGranting || !newAuthorAddress || !newAuthorName}
                className="modern-button w-full"
              >
                {isGranting ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Grant Author Permission</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* How It Works */}
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-neon-green/10 to-neon-cyan/10 dark:from-neon-green/5 dark:to-neon-cyan/5">
              <h2 className="text-2xl font-bold text-navy-800 dark:text-navy-200">
                How It Works
              </h2>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center flex-shrink-0 text-white font-bold shadow-lg">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-navy-700 dark:text-navy-300 mb-2">
                    Admin Capability Check
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Only Admin_Capability holders can perform this operation
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center flex-shrink-0 text-white font-bold shadow-lg">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-navy-700 dark:text-navy-300 mb-2">
                    Mint Author_Capability
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    A new Author_Capability object is created on-chain
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center flex-shrink-0 text-white font-bold shadow-lg">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-navy-700 dark:text-navy-300 mb-2">
                    Transfer to Author
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Capability is transferred to the specified address
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-neon-green/10 to-neon-cyan/10 border border-neon-green/20">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong className="text-navy-700 dark:text-navy-300">Important:</strong> Author_Capability is non-copyable and non-droppable, ensuring secure permission management.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {grantSuccess && txHash && (
          <div className="glass-card p-8 mb-8 border-2 border-neon-green/30 bg-gradient-to-r from-neon-green/5 to-neon-cyan/5">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center shadow-lg">
                <span className="text-3xl">✅</span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-navy-800 dark:text-navy-200 mb-3">
                  Author Permission Granted!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Author_Capability has been created and transferred to the specified address.
                </p>
                
                <div className="p-4 rounded-xl bg-white dark:bg-navy-900">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    Sui Transaction Hash
                  </div>
                  <div className="font-mono text-sm text-navy-700 dark:text-navy-300 break-all">
                    {txHash}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Authors List */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-navy-50 to-navy-100 dark:from-navy-900 dark:to-navy-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-navy-800 dark:text-navy-200">
                  Authorized Authors
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Users with Author_Capability
                </p>
              </div>
              <div className="neon-badge text-lg">
                {authors.length} {authors.length === 1 ? 'Author' : 'Authors'}
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {authors.map((author) => (
              <div key={author.address} className="p-6 hover:bg-navy-50 dark:hover:bg-navy-900 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-navy-100 to-navy-200 dark:from-navy-800 dark:to-navy-700 flex items-center justify-center group-hover:shadow-lg transition-shadow">
                      <span className="text-2xl">✍️</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-navy-800 dark:text-navy-200 mb-1">
                        {author.name}
                      </h3>
                      <div className="font-mono text-sm text-gray-600 dark:text-gray-400">
                        {formatAddress(author.address)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      Permission Granted
                    </div>
                    <div className="text-sm font-medium text-navy-700 dark:text-navy-300">
                      {formatDate(author.granted_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
