/**
 * Client Factory
 * Creates appropriate client instances based on environment configuration
 */

import { IStorageClient, StorageProvider } from './interfaces/storage.interface';
import { IBlockchainClient, BlockchainProvider } from './interfaces/blockchain.interface';
import { IWalletClient, WalletProvider } from './interfaces/wallet.interface';

import { WalrusStorageClient } from './walrus/walrusStorage';
import { SuiBlockchainClient } from './sui/suiBlockchain';
import { SuiWalletClient } from './sui/suiWallet';

// Environment configuration - defaults to real providers
const STORAGE_PROVIDER = (process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'walrus') as StorageProvider;
const BLOCKCHAIN_PROVIDER = (process.env.NEXT_PUBLIC_BLOCKCHAIN_PROVIDER || 'sui') as BlockchainProvider;
const WALLET_PROVIDER = (process.env.NEXT_PUBLIC_WALLET_PROVIDER || 'sui') as WalletProvider;

// Singleton instances
let storageClient: IStorageClient | null = null;
let blockchainClient: IBlockchainClient | null = null;
let walletClient: IWalletClient | null = null;

/**
 * Get storage client instance
 */
export function getStorageClient(): IStorageClient {
  if (!storageClient) {
    switch (STORAGE_PROVIDER) {
      case 'walrus':
      default:
        storageClient = new WalrusStorageClient();
        console.log('🐋 Using Walrus Storage');
        break;
    }
  }
  return storageClient;
}

/**
 * Get blockchain client instance
 */
export function getBlockchainClient(): IBlockchainClient {
  if (!blockchainClient) {
    switch (BLOCKCHAIN_PROVIDER) {
      case 'sui':
      default:
        blockchainClient = new SuiBlockchainClient();
        console.log('⛓️  Using Sui Blockchain');
        break;
    }
  }
  return blockchainClient;
}

/**
 * Get wallet client instance
 */
export function getWalletClient(): IWalletClient {
  if (!walletClient) {
    switch (WALLET_PROVIDER) {
      case 'sui':
      default:
        walletClient = new SuiWalletClient();
        console.log('👛 Using Sui Wallet');
        break;
    }
  }
  return walletClient;
}

/**
 * Get provider configuration
 */
export function getProviderConfig() {
  return {
    storage: STORAGE_PROVIDER,
    blockchain: BLOCKCHAIN_PROVIDER,
    wallet: WALLET_PROVIDER,
  };
}

/**
 * Initialize Sui wallet connection
 * This should be called from a React component with dApp Kit hooks
 */
export function initializeSuiWallet(handlers: {
  account: { address: string } | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signAndExecute: (tx: any) => Promise<{ digest: string }>;
}) {
  const wallet = getWalletClient();
  if (wallet instanceof SuiWalletClient) {
    wallet.setWalletHandlers(handlers);
  }

  const blockchain = getBlockchainClient();
  if (blockchain instanceof SuiBlockchainClient) {
    blockchain.setWallet(handlers.signAndExecute);
  }
}

/**
 * Reset all client instances (useful for testing or reconnection)
 */
export function resetClients() {
  storageClient = null;
  blockchainClient = null;
  walletClient = null;
}

