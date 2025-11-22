/**
 * Sui Blockchain Implementation
 * Real Sui integration with @mysten/sui SDK
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';
import {
  IBlockchainClient,
  TransactionResult,
  PageMetadata,
  RegistryStats,
  EditRequest,
} from '../interfaces/blockchain.interface';

export class SuiBlockchainClient implements IBlockchainClient {
  private client: SuiClient;
  private packageId: string;

  constructor(
    walletSignAndExecute?: (tx: Transaction) => Promise<{ digest: string }>
  ) {
    const network =
      (process.env.NEXT_PUBLIC_SUI_NETWORK as 'mainnet' | 'testnet' | 'devnet' | 'localnet') || 'testnet';
    this.client = new SuiClient({ url: getFullnodeUrl(network) });
    this.packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
    this.walletSignAndExecute = walletSignAndExecute;

    if (!this.packageId) {
      console.warn('NEXT_PUBLIC_PACKAGE_ID not set in environment variables');
    }
  }

  private walletSignAndExecute?: (tx: Transaction) => Promise<{ digest: string }>;

  /**
   * Set wallet sign and execute function
   * This should be called after wallet connection
   */
  setWallet(walletSignAndExecute: (tx: Transaction) => Promise<{ digest: string }>) {
    this.walletSignAndExecute = walletSignAndExecute;
  }

  /**
   * Create a new page
   */
  async createPage(
    authorCapId: string,
    registryId: string,
    walrusBlobId: string
  ): Promise<TransactionResult> {
    try {
      if (!this.walletSignAndExecute) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      if (!this.packageId) {
        throw new Error('Package ID not configured. Set NEXT_PUBLIC_PACKAGE_ID in .env');
      }

      const tx = new Transaction();
      
      // Debug log
      console.log('📝 Creating page with:', { 
        authorCapId, 
        registryId, 
        walrusBlobId,
        packageId: this.packageId 
      });
      
      // Validate IDs format
      if (!authorCapId || !authorCapId.startsWith('0x') || authorCapId.length !== 66) {
        throw new Error(`Invalid authorCapId format: ${authorCapId}`);
      }
      if (!registryId || !registryId.startsWith('0x') || registryId.length !== 66) {
        throw new Error(`Invalid registryId format: ${registryId}`);
      }
      
      tx.moveCall({
        target: `${this.packageId}::contract::create_page`,
        arguments: [
          tx.object(authorCapId),
          tx.object(registryId),
          tx.pure(bcs.string().serialize(walrusBlobId).toBytes()), // BCS string serialization
        ],
      });

      const result = await this.walletSignAndExecute(tx);
      
      return {
        success: true,
        txHash: result.digest,
      };
    } catch (error: any) {
      console.error('Error creating page:', error);
      return {
        success: false,
        txHash: '',
        error: error.message || 'Failed to create page',
      };
  }
  }

  /**
   * Update page content with new Walrus blob
   */
  async updatePageContent(
    authorCapId: string,
    pageId: string,
    newWalrusBlobId: string
  ): Promise<TransactionResult> {
    try {
      if (!this.walletSignAndExecute) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      if (!this.packageId) {
        throw new Error('Package ID not configured. Set NEXT_PUBLIC_PACKAGE_ID in .env');
      }

      const tx = new Transaction();
      
      tx.moveCall({
        target: `${this.packageId}::contract::update_page_content`,
        arguments: [
          tx.object(authorCapId),
          tx.object(pageId),
          tx.pure(bcs.string().serialize(newWalrusBlobId).toBytes()), // BCS string serialization
        ],
      });

      const result = await this.walletSignAndExecute(tx);
      
      return {
        success: true,
        txHash: result.digest,
      };
    } catch (error: any) {
      console.error('Error updating page:', error);
      return {
        success: false,
        txHash: '',
        error: error.message || 'Failed to update page',
      };
  }
  }

  /**
   * Delete a page (soft delete)
   */
  async deletePage(
    authorCapId: string,
    pageId: string
  ): Promise<TransactionResult> {
    try {
      if (!this.walletSignAndExecute) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      if (!this.packageId) {
        throw new Error('Package ID not configured. Set NEXT_PUBLIC_PACKAGE_ID in .env');
      }

      const tx = new Transaction();
      
      tx.moveCall({
        target: `${this.packageId}::contract::delete_page`,
        arguments: [
          tx.object(authorCapId),
          tx.object(pageId),
        ],
      });

      const result = await this.walletSignAndExecute(tx);
      
      return {
        success: true,
        txHash: result.digest,
      };
    } catch (error: any) {
      console.error('Error deleting page:', error);
      return {
        success: false,
        txHash: '',
        error: error.message || 'Failed to delete page',
      };
    }
  }

  /**
   * Grant author capability to an address
   */
  async grantAuthorCapability(
    adminCapId: string,
    recipientAddress: string
  ): Promise<TransactionResult> {
    try {
      if (!this.walletSignAndExecute) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      if (!this.packageId) {
        throw new Error('Package ID not configured. Set NEXT_PUBLIC_PACKAGE_ID in .env');
      }

      const tx = new Transaction();
      
      // Sui addresses should be passed using tx.pure.address()
      // Ensure address is in correct format (lowercase, with 0x prefix)
      const normalizedAddress = recipientAddress.toLowerCase().startsWith('0x') 
        ? recipientAddress.toLowerCase() 
        : `0x${recipientAddress.toLowerCase()}`;
      
      tx.moveCall({
        target: `${this.packageId}::contract::grant_author_capability`,
        arguments: [
          tx.object(adminCapId),
          tx.pure.address(normalizedAddress),
        ],
      });

      const result = await this.walletSignAndExecute(tx);
      
      return {
        success: true,
        txHash: result.digest,
      };
    } catch (error: any) {
      console.error('Error granting author capability:', error);
      return {
        success: false,
        txHash: '',
        error: error.message || 'Failed to grant author capability',
      };
  }
  }

  /**
   * Get page metadata from blockchain
   */
  async getPageMetadata(pageId: string): Promise<PageMetadata> {
    try {
      const object = await this.client.getObject({
        id: pageId,
        options: { showContent: true },
      });

      if (!object.data || !object.data.content || object.data.content.dataType !== 'moveObject') {
        throw new Error('Invalid page object');
      }

      const fields = object.data.content.fields as any;

      return {
        pageId: Number(fields.page_id),
        walrusBlobId: fields.walrus_blob_id,
        version: Number(fields.version),
        author: fields.author,
        createdAt: Number(fields.created_at),
        updatedAt: Number(fields.updated_at),
        deleted: fields.deleted || false,
      };
    } catch (error: any) {
      console.error('Error fetching page metadata:', error);
      throw new Error(`Failed to fetch page metadata: ${error.message}`);
  }
  }

  /**
   * Get registry statistics
   */
  async getRegistryStats(registryId: string): Promise<RegistryStats> {
    try {
      const object = await this.client.getObject({
        id: registryId,
        options: { showContent: true },
      });

      if (!object.data || !object.data.content || object.data.content.dataType !== 'moveObject') {
        throw new Error('Invalid registry object');
      }

      const fields = object.data.content.fields as any;

      return {
        totalPages: Number(fields.total_pages),
        createdAt: Number(fields.created_at),
      };
    } catch (error: any) {
      console.error('Error fetching registry stats:', error);
      throw new Error(`Failed to fetch registry stats: ${error.message}`);
    }
  }

  /**
   * Get all pages from registry
   */
  async getAllPages(registryId: string): Promise<string[]> {
    try {
      const stats = await this.getRegistryStats(registryId);
      const pageIds: string[] = [];

      // Get registry object to access page_registry table
      const object = await this.client.getObject({
        id: registryId,
        options: { showContent: true },
      });

      if (!object.data || !object.data.content || object.data.content.dataType !== 'moveObject') {
        throw new Error('Invalid registry object');
      }

      const fields = object.data.content.fields as any;
      const pageRegistryId = fields.page_registry?.fields?.id?.id;

      if (!pageRegistryId) {
        return pageIds;
      }

      // Query dynamic fields for the table
      // This gets all page addresses from the page_registry table
      for (let i = 0; i < stats.totalPages; i++) {
        try {
          const dynamicField = await this.client.getDynamicFieldObject({
            parentId: pageRegistryId,
            name: {
              type: 'u64',
              value: i.toString(),
            },
          });

          if (dynamicField.data?.content && dynamicField.data.content.dataType === 'moveObject') {
            const value = (dynamicField.data.content.fields as any).value;
            if (value) {
              pageIds.push(value);
            }
          }
        } catch (error) {
          console.warn(`Could not fetch page ${i}:`, error);
        }
      }

      return pageIds;
    } catch (error: any) {
      console.error('Error fetching all pages:', error);
      throw new Error(`Failed to fetch all pages: ${error.message}`);
    }
  }

  /**
   * Create an edit request for a page
   */
  async createEditRequest(
    pageId: string,
    newWalrusBlobId: string
  ): Promise<TransactionResult> {
    try {
      if (!this.walletSignAndExecute) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      if (!this.packageId) {
        throw new Error('Package ID not configured. Set NEXT_PUBLIC_PACKAGE_ID in .env');
      }

      const tx = new Transaction();
      
      tx.moveCall({
        target: `${this.packageId}::contract::create_edit_request`,
        arguments: [
          tx.object(pageId),
          tx.pure(bcs.string().serialize(newWalrusBlobId).toBytes()),
        ],
      });

      const result = await this.walletSignAndExecute(tx);
      
      return {
        success: true,
        txHash: result.digest,
      };
    } catch (error: any) {
      console.error('Error creating edit request:', error);
      return {
        success: false,
        txHash: '',
        error: error.message || 'Failed to create edit request',
      };
    }
  }

  /**
   * Approve an edit request and update page content
   */
  async approveEditRequest(
    authorCapId: string,
    pageId: string,
    requestId: number
  ): Promise<TransactionResult> {
    try {
      if (!this.walletSignAndExecute) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      if (!this.packageId) {
        throw new Error('Package ID not configured. Set NEXT_PUBLIC_PACKAGE_ID in .env');
      }

      const tx = new Transaction();
      
      tx.moveCall({
        target: `${this.packageId}::contract::approve_edit_request`,
        arguments: [
          tx.object(authorCapId),
          tx.object(pageId),
          tx.pure.u64(requestId),
        ],
      });

      const result = await this.walletSignAndExecute(tx);
      
      return {
        success: true,
        txHash: result.digest,
      };
    } catch (error: any) {
      console.error('Error approving edit request:', error);
      return {
        success: false,
        txHash: '',
        error: error.message || 'Failed to approve edit request',
      };
    }
  }

  /**
   * Reject an edit request
   */
  async rejectEditRequest(
    authorCapId: string,
    pageId: string,
    requestId: number
  ): Promise<TransactionResult> {
    try {
      if (!this.walletSignAndExecute) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      if (!this.packageId) {
        throw new Error('Package ID not configured. Set NEXT_PUBLIC_PACKAGE_ID in .env');
      }

      const tx = new Transaction();
      
      tx.moveCall({
        target: `${this.packageId}::contract::reject_edit_request`,
        arguments: [
          tx.object(authorCapId),
          tx.object(pageId),
          tx.pure.u64(requestId),
        ],
      });

      const result = await this.walletSignAndExecute(tx);
      
      return {
        success: true,
        txHash: result.digest,
      };
    } catch (error: any) {
      console.error('Error rejecting edit request:', error);
      return {
        success: false,
        txHash: '',
        error: error.message || 'Failed to reject edit request',
      };
    }
  }

  /**
   * Get all edit requests for a page
   */
  async getEditRequests(pageId: string): Promise<EditRequest[]> {
    try {
      const object = await this.client.getObject({
        id: pageId,
        options: { showContent: true },
      });

      if (!object.data || !object.data.content || object.data.content.dataType !== 'moveObject') {
        throw new Error('Invalid page object');
      }

      const fields = object.data.content.fields as any;
      const editRequestsTableId = fields.edit_requests?.fields?.id?.id;
      const nextRequestId = Number(fields.next_request_id || 0);

      if (!editRequestsTableId || nextRequestId === 0) {
        return [];
      }

      const requests: EditRequest[] = [];

      // Query all edit requests from the table
      for (let i = 0; i < nextRequestId; i++) {
        try {
          const dynamicField = await this.client.getDynamicFieldObject({
            parentId: editRequestsTableId,
            name: {
              type: 'u64',
              value: i.toString(),
            },
          });

          if (dynamicField.data?.content && dynamicField.data.content.dataType === 'moveObject') {
            const requestFields = dynamicField.data.content.fields as any;
            const statusNum = Number(requestFields.status || 0);
            const status = statusNum === 0 ? 'pending' : statusNum === 1 ? 'approved' : 'rejected';

            requests.push({
              requestId: Number(requestFields.request_id),
              pageId: Number(requestFields.page_id),
              requester: requestFields.requester,
              newWalrusBlobId: requestFields.new_walrus_blob_id,
              status,
              createdAt: Number(requestFields.created_at),
              processedAt: Number(requestFields.processed_at || 0),
            });
          }
        } catch (error) {
          // Request might not exist, continue
          continue;
        }
      }

      return requests.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error: any) {
      console.error('Error fetching edit requests:', error);
      throw new Error(`Failed to fetch edit requests: ${error.message}`);
    }
  }
}

