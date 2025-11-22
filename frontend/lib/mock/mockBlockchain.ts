/**
 * Mock Blockchain Implementation
 * Simulates Sui blockchain for development and testing
 */

import {
  IBlockchainClient,
  TransactionResult,
  PageMetadata,
  RegistryStats,
} from '../interfaces/blockchain.interface';

export class MockBlockchainClient implements IBlockchainClient {
  private pages = new Map<string, PageMetadata>();
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
    if (!page) {
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

  private generateTxHash(): string {
    return `0x${Math.random().toString(16).substring(2, 66).padEnd(64, '0')}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

