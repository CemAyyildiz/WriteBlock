/**
 * Custom hook for wallet capabilities
 * Manages user's admin and author capabilities
 */

import { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { getWalletClient, getProviderConfig, initializeSuiWallet } from '@/lib/client';

export type UserRole = 'admin' | 'author' | 'viewer';

export interface WalletCapabilities {
  authorCapId: string | null;
  adminCapId: string | null;
  registryId: string | null;
  role: UserRole;
  isLoading: boolean;
}

/**
 * Hook to fetch and manage user's wallet capabilities
 * Automatically initializes Sui wallet connection
 */
export function useWalletCapabilities(): WalletCapabilities {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const config = getProviderConfig();
  
  const [authorCapId, setAuthorCapId] = useState<string | null>(null);
  const [adminCapId, setAdminCapId] = useState<string | null>(null);
  const [registryId, setRegistryId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>('viewer');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCapabilities() {
      if (!currentAccount) {
        setAuthorCapId(null);
        setAdminCapId(null);
        setRole('viewer');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Initialize Sui wallet if using Sui
        if (config.wallet === 'sui') {
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
        }

        // Fetch capabilities
        const wallet = getWalletClient();
        const caps = await wallet.getUserCapabilities(currentAccount.address);

        // Set capabilities and determine role based on what user actually owns
        if (caps.adminCapId) {
          setAdminCapId(caps.adminCapId);
          setRole('admin');
        } else if (caps.authorCapId) {
          setAuthorCapId(caps.authorCapId);
          setRole('author');
        } else {
          setRole('viewer');
        }

        // Also set author capability if exists (admin can also be author)
        if (caps.authorCapId) {
          setAuthorCapId(caps.authorCapId);
        }

        // Get registry ID
        const envRegistryId = process.env.NEXT_PUBLIC_REGISTRY_ID;
        if (envRegistryId) {
          setRegistryId(envRegistryId);
        }
      } catch (error) {
        console.error('Error fetching capabilities:', error);
        setRole('viewer');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCapabilities();
  }, [currentAccount, signAndExecuteTransaction, config.wallet]);

  return {
    authorCapId,
    adminCapId,
    registryId,
    role,
    isLoading,
  };
}

