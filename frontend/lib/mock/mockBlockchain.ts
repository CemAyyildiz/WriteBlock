/**
 * Mock Blockchain Implementation
 * Simulates Sui blockchain for development and testing
 */

import {
  IBlockchainClient,
  TransactionResult,
  PageMetadata,
  RegistryStats,
  EditRequest,
} from '../interfaces/blockchain.interface';

export class MockBlockchainClient implements IBlockchainClient {
  private pages = new Map<string, PageMetadata>();
  private editRequests = new Map<string, EditRequest[]>(); // pageId -> EditRequest[]
  private registry: RegistryStats = {
    totalPages: 0,
    createdAt: Date.now(),
  };

  async createPage(
    authorCapId: string,
    registryId: string,
    walrusBlobId: string
  ): Promise<TransactionResult> {
    await this.delay(1500);

    const pageId = `page_${this.registry.totalPages}`;
    const page: PageMetadata = {
      pageId: this.registry.totalPages,
      walrusBlobId,
      version: 0,
      author: '0xmock_author_address',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deleted: false,
    };

    this.pages.set(pageId, page);
    this.registry.totalPages++;

    const txHash = this.generateTxHash();
    console.log(`[Mock Blockchain] Created page: ${pageId}, TX: ${txHash}`);

    return {
      success: true,
      txHash,
    };
  }

  async updatePageContent(
    authorCapId: string,
    pageId: string,
    newWalrusBlobId: string
  ): Promise<TransactionResult> {
    await this.delay(1500);

    const page = this.pages.get(pageId);
    if (!page || page.deleted) {
      return {
        success: false,
        txHash: '',
        error: 'Page not found',
      };
    }

    page.walrusBlobId = newWalrusBlobId;
    page.version++;
    page.updatedAt = Date.now();

    const txHash = this.generateTxHash();
    console.log(`[Mock Blockchain] Updated page: ${pageId}, New version: ${page.version}, TX: ${txHash}`);

    return {
      success: true,
      txHash,
    };
  }

  async deletePage(
    authorCapId: string,
    pageId: string
  ): Promise<TransactionResult> {
    await this.delay(1500);

    const page = this.pages.get(pageId);
    if (!page || page.deleted) {
      return {
        success: false,
        txHash: '',
        error: 'Page not found',
      };
    }

    page.deleted = true;
    page.updatedAt = Date.now();

    const txHash = this.generateTxHash();
    console.log(`[Mock Blockchain] Deleted page: ${pageId}, TX: ${txHash}`);

    return {
      success: true,
      txHash,
    };
  }

  async grantAuthorCapability(
    adminCapId: string,
    recipientAddress: string
  ): Promise<TransactionResult> {
    await this.delay(1200);

    const txHash = this.generateTxHash();
    console.log(`[Mock Blockchain] Granted author capability to: ${recipientAddress}, TX: ${txHash}`);

    return {
      success: true,
      txHash,
    };
  }

  async getPageMetadata(pageId: string): Promise<PageMetadata> {
    await this.delay(300);

    const page = this.pages.get(pageId);
    if (!page) {
      throw new Error('Page not found');
    }

    return page;
  }

  async getRegistryStats(registryId: string): Promise<RegistryStats> {
    await this.delay(200);
    return this.registry;
  }

  async getAllPages(registryId: string): Promise<string[]> {
    await this.delay(300);
    return Array.from(this.pages.keys());
  }

  async createEditRequest(
    pageId: string,
    newWalrusBlobId: string
  ): Promise<TransactionResult> {
    await this.delay(1500);

    const page = this.pages.get(pageId);
    if (!page || page.deleted) {
      return {
        success: false,
        txHash: '',
        error: 'Page not found',
      };
    }

    const requests = this.editRequests.get(pageId) || [];
    const requestId = requests.length;
    
    const request: EditRequest = {
      requestId,
      pageId: page.pageId,
      requester: '0xmock_requester_address',
      newWalrusBlobId,
      status: 'pending',
      createdAt: Date.now(),
      processedAt: 0,
    };

    requests.push(request);
    this.editRequests.set(pageId, requests);

    const txHash = this.generateTxHash();
    console.log(`[Mock Blockchain] Created edit request: ${requestId} for page ${pageId}, TX: ${txHash}`);

    return {
      success: true,
      txHash,
    };
  }

  async approveEditRequest(
    authorCapId: string,
    pageId: string,
    requestId: number
  ): Promise<TransactionResult> {
    await this.delay(1500);

    const page = this.pages.get(pageId);
    if (!page || page.deleted) {
      return {
        success: false,
        txHash: '',
        error: 'Page not found',
      };
    }

    const requests = this.editRequests.get(pageId) || [];
    const request = requests.find(r => r.requestId === requestId);
    
    if (!request || request.status !== 'pending') {
      return {
        success: false,
        txHash: '',
        error: 'Edit request not found or already processed',
      };
    }

    // Update page content
    page.walrusBlobId = request.newWalrusBlobId;
    page.version++;
    page.updatedAt = Date.now();

    // Mark request as approved
    request.status = 'approved';
    request.processedAt = Date.now();

    const txHash = this.generateTxHash();
    console.log(`[Mock Blockchain] Approved edit request: ${requestId} for page ${pageId}, TX: ${txHash}`);

    return {
      success: true,
      txHash,
    };
  }

  async rejectEditRequest(
    authorCapId: string,
    pageId: string,
    requestId: number
  ): Promise<TransactionResult> {
    await this.delay(1500);

    const page = this.pages.get(pageId);
    if (!page || page.deleted) {
      return {
        success: false,
        txHash: '',
        error: 'Page not found',
      };
    }

    const requests = this.editRequests.get(pageId) || [];
    const request = requests.find(r => r.requestId === requestId);
    
    if (!request || request.status !== 'pending') {
      return {
        success: false,
        txHash: '',
        error: 'Edit request not found or already processed',
      };
    }

    // Mark request as rejected
    request.status = 'rejected';
    request.processedAt = Date.now();

    const txHash = this.generateTxHash();
    console.log(`[Mock Blockchain] Rejected edit request: ${requestId} for page ${pageId}, TX: ${txHash}`);

    return {
      success: true,
      txHash,
    };
  }

  async getEditRequests(pageId: string): Promise<EditRequest[]> {
    await this.delay(300);
    return this.editRequests.get(pageId) || [];
  }

  private generateTxHash(): string {
    return `0x${Math.random().toString(16).substring(2, 66).padEnd(64, '0')}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

