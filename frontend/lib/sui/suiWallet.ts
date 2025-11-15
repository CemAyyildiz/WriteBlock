/**
 * Sui Wallet Implementation
 * Real Sui dApp Kit integration
 * Note: This client is designed to work with Sui dApp Kit hooks
 * Some methods require React context and should be called from components
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import {
  IWalletClient,
  UserCapabilities,
  TransactionResult,
} from '../interfaces/wallet.interface';

export class SuiWalletClient implements IWalletClient {
  private client: SuiClient;
  private currentAccount: { address: string } | null = null;
  private packageId: string;
  
  // These will be set by React hooks in components
  private connectWallet?: () => Promise<void>;
  private disconnectWallet?: () => Promise<void>;
  private signAndExecute?: (tx: Transaction) => Promise<{ digest: string }>;

  constructor() {
    const network =
      (process.env.NEXT_PUBLIC_SUI_NETWORK as 'mainnet' | 'testnet' | 'devnet' | 'localnet') || 'testnet';
    this.client = new SuiClient({ url: getFullnodeUrl(network) });
    this.packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
  }

  /**
   * Set wallet functions from React hooks
   * Call this from a component that uses Sui dApp Kit hooks
   */
  setWalletHandlers(handlers: {
    account: { address: string } | null;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    signAndExecute: (tx: Transaction) => Promise<{ digest: string }>;
  }) {
    this.currentAccount = handlers.account;
    this.connectWallet = handlers.connect;
    this.disconnectWallet = handlers.disconnect;
    this.signAndExecute = handlers.signAndExecute;
  }

  /**
   * Connect to wallet
   */
  async connect(): Promise<string> {
    if (!this.connectWallet) {
      throw new Error(
        'Wallet handlers not initialized. Call setWalletHandlers first from a React component.'
      );
    }

    await this.connectWallet();

    if (!this.currentAccount) {
      throw new Error('Failed to connect wallet');
    }

    return this.currentAccount.address;
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    if (!this.disconnectWallet) {
      throw new Error(
        'Wallet handlers not initialized. Call setWalletHandlers first from a React component.'
      );
    }

    await this.disconnectWallet();
    this.currentAccount = null;
  }

  /**
   * Get current connected address
   */
  async getCurrentAddress(): Promise<string | null> {
    return this.currentAccount?.address || null;
  }

  /**
   * Check if wallet is connected
   */
  async isConnected(): Promise<boolean> {
    return this.currentAccount !== null;
  }

  /**
   * Get user's capabilities by querying owned objects
   */
  async getUserCapabilities(address: string): Promise<UserCapabilities> {
    try {
      const result: UserCapabilities = {
        hasAdminCap: false,
        hasAuthorCap: false,
      };

      // Query all objects owned by the address
      const ownedObjects = await this.client.getOwnedObjects({
        owner: address,
        options: {
          showType: true,
          showContent: true,
        },
      });

      // Check for Admin and Author capabilities
      for (const obj of ownedObjects.data) {
        if (!obj.data || !obj.data.type) continue;

        const type = obj.data.type;

        // Check for Admin_Capability
        if (type.includes('::contract::Admin_Capability')) {
          result.hasAdminCap = true;
          result.adminCapId = obj.data.objectId;
        }

        // Check for Author_Capability
        if (type.includes('::contract::Author_Capability')) {
          result.hasAuthorCap = true;
          result.authorCapId = obj.data.objectId;
        }
      }

      return result;
    } catch (error: any) {
      console.error('Error fetching user capabilities:', error);
      throw new Error(`Failed to fetch user capabilities: ${error.message}`);
    }
  }

  /**
   * Sign and execute transaction
   */
  async signAndExecuteTransaction(transaction: Transaction): Promise<TransactionResult> {
    try {
      if (!this.signAndExecute) {
        throw new Error(
          'Wallet handlers not initialized. Call setWalletHandlers first from a React component.'
        );
      }

      if (!this.currentAccount) {
        throw new Error('Wallet not connected');
      }

      const result = await this.signAndExecute(transaction);

      return {
        success: true,
        txHash: result.digest,
      };
    } catch (error: any) {
      console.error('Error signing and executing transaction:', error);
      return {
        success: false,
        txHash: '',
        error: error.message || 'Failed to execute transaction',
      };
    }
  }

  /**
   * Get registry object ID
   * This queries for the shared CMS_Registry object
   */
  async getRegistryId(): Promise<string | null> {
    try {
      if (!this.packageId) {
        throw new Error('Package ID not configured');
      }

      // Query for CMS_Registry shared object
      const registryType = `${this.packageId}::contract::CMS_Registry`;
      
      // Get objects by type
      // Note: This might need adjustment based on how the registry is deployed
      const response = await this.client.queryEvents({
        query: {
          MoveEventType: `${this.packageId}::contract::PageCreatedEvent`,
        },
        limit: 1,
      });

      // Alternative: If we know the registry object ID from deployment,
      // it should be stored in environment variables
      const registryId = process.env.NEXT_PUBLIC_REGISTRY_ID;
      
      if (registryId) {
        return registryId;
      }

      console.warn('Registry ID not found. Please set NEXT_PUBLIC_REGISTRY_ID in .env');
      return null;
    } catch (error) {
      console.error('Error fetching registry ID:', error);
      return null;
    }
  }

  /**
   * Get Sui client for direct queries
   */
  getClient(): SuiClient {
    return this.client;
  }
}

