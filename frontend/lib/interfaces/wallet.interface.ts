/**
 * Wallet Interface - Abstraction for wallet connection and account management
 * Implementations: Sui Wallet Kit
 */

export interface IWalletClient {
  /**
   * Connect to wallet
   * @returns Connected address
   */
  connect(): Promise<string>;

  /**
   * Disconnect wallet
   */
  disconnect(): Promise<void>;

  /**
   * Get current connected address
   * @returns Address or null if not connected
   */
  getCurrentAddress(): Promise<string | null>;

  /**
   * Check if wallet is connected
   */
  isConnected(): Promise<boolean>;

  /**
   * Get user's capabilities
   * @param address - User address
   * @returns User capabilities
   */
  getUserCapabilities(address: string): Promise<UserCapabilities>;

  /**
   * Sign and execute transaction
   * @param transaction - Transaction block
   * @returns Transaction result
   */
  signAndExecuteTransaction(transaction: any): Promise<TransactionResult>;
}

export interface UserCapabilities {
  hasAdminCap: boolean;
  hasAuthorCap: boolean;
  adminCapId?: string;
  authorCapId?: string;
}

export interface TransactionResult {
  success: boolean;
  txHash: string;
  error?: string;
}

export type WalletProvider = 'sui';

