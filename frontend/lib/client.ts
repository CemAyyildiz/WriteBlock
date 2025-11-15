/**
 * Client Factory
 * Creates appropriate client instances based on environment configuration
 */

import { IStorageClient, StorageProvider } from './interfaces/storage.interface';
import { IBlockchainClient, BlockchainProvider } from './interfaces/blockchain.interface';
import { IWalletClient, WalletProvider } from './interfaces/wallet.interface';

import { MockStorageClient } from './mock/mockStorage';
import { MockBlockchainClient } from './mock/mockBlockchain';
import { MockWalletClient } from './mock/mockWallet';

import { WalrusStorageClient } from './walrus/walrusStorage';
import { SuiBlockchainClient } from './sui/suiBlockchain';
import { SuiWalletClient } from './sui/suiWallet';

// Environment configuration
const STORAGE_PROVIDER = (process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'mock') as StorageProvider;
const BLOCKCHAIN_PROVIDER = (process.env.NEXT_PUBLIC_BLOCKCHAIN_PROVIDER || 'mock') as BlockchainProvider;
const WALLET_PROVIDER = (process.env.NEXT_PUBLIC_WALLET_PROVIDER || 'mock') as WalletProvider;

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
        storageClient = new WalrusStorageClient();
        console.log('🐋 Using Walrus Storage');
        break;
      case 'mock':
      default:
        storageClient = new MockStorageClient();
        console.log('🎭 Using Mock Storage');
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
        blockchainClient = new SuiBlockchainClient();
        console.log('⛓️  Using Sui Blockchain');
        break;
      case 'mock':
      default:
        blockchainClient = new MockBlockchainClient();
        console.log('🎭 Using Mock Blockchain');
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
        walletClient = new SuiWalletClient();
        console.log('👛 Using Sui Wallet');
        break;
      case 'mock':
      default:
        walletClient = new MockWalletClient();
        console.log('🎭 Using Mock Wallet');
        break;
    }
  }
  return walletClient;
}

/**
 * Check if using mock providers
 */
export function isUsingMock(): boolean {
  return STORAGE_PROVIDER === 'mock' && 
         BLOCKCHAIN_PROVIDER === 'mock' && 
         WALLET_PROVIDER === 'mock';
}

/**
 * Get provider configuration
 */
export function getProviderConfig() {
  return {
    storage: STORAGE_PROVIDER,
    blockchain: BLOCKCHAIN_PROVIDER,
    wallet: WALLET_PROVIDER,
    isMock: isUsingMock(),
  };
}

