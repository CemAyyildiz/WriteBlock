/**
 * Mock Wallet Implementation
 * Simulates Sui wallet for development and testing
 */

import {
  IWalletClient,
  UserCapabilities,
  TransactionResult,
} from '../interfaces/wallet.interface';

export class MockWalletClient implements IWalletClient {
  private connectedAddress: string | null = null;
  
  // Mock addresses with different roles
  private mockUsers = {
    admin: {
      address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      hasAdminCap: true,
      hasAuthorCap: true,
      adminCapId: 'admin_cap_123',
      authorCapId: 'author_cap_456',
    },
    author: {
      address: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      hasAdminCap: false,
      hasAuthorCap: true,
      authorCapId: 'author_cap_789',
    },
    viewer: {
      address: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
      hasAdminCap: false,
      hasAuthorCap: false,
    },
  };

  async connect(): Promise<string> {
    await this.delay(500);
    
    // Simulate connecting as author by default
    this.connectedAddress = this.mockUsers.author.address;
    
    console.log(`[Mock Wallet] Connected: ${this.connectedAddress}`);
    return this.connectedAddress;
  }

  async disconnect(): Promise<void> {
    await this.delay(300);
    this.connectedAddress = null;
    console.log('[Mock Wallet] Disconnected');
  }

  async getCurrentAddress(): Promise<string | null> {
    return this.connectedAddress;
  }

  async isConnected(): Promise<boolean> {
    return this.connectedAddress !== null;
  }

  async getUserCapabilities(address: string): Promise<UserCapabilities> {
    await this.delay(200);

    // Find mock user
    const user = Object.values(this.mockUsers).find(u => u.address === address);
    
    if (!user) {
      return {
        hasAdminCap: false,
        hasAuthorCap: false,
      };
    }

    return {
      hasAdminCap: user.hasAdminCap,
      hasAuthorCap: user.hasAuthorCap,
      adminCapId: user.adminCapId,
      authorCapId: user.authorCapId,
    };
  }

  async signAndExecuteTransaction(transaction: any): Promise<TransactionResult> {
    await this.delay(1500);

    if (!this.connectedAddress) {
      return {
        success: false,
        txHash: '',
        error: 'Wallet not connected',
      };
    }

    const txHash = this.generateTxHash();
    console.log(`[Mock Wallet] Transaction signed and executed: ${txHash}`);

    return {
      success: true,
      txHash,
    };
  }

  // Helper methods for testing
  async connectAs(role: 'admin' | 'author' | 'viewer'): Promise<string> {
    this.connectedAddress = this.mockUsers[role].address;
    console.log(`[Mock Wallet] Connected as ${role}: ${this.connectedAddress}`);
    return this.connectedAddress;
  }

  private generateTxHash(): string {
    return `0x${Math.random().toString(16).substring(2, 66).padEnd(64, '0')}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

