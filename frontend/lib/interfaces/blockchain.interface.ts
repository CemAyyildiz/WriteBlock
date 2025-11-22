/**
 * Blockchain Interface - Abstraction for Sui blockchain interactions
 * Implementations: Mock, Sui
 */

export interface IBlockchainClient {
  /**
   * Create a new page
   * @param authorCapId - Author capability object ID
   * @param registryId - CMS Registry object ID
   * @param walrusBlobId - Initial content BLOB ID
   * @returns Transaction result
   */
  createPage(
    authorCapId: string,
    registryId: string,
    walrusBlobId: string
  ): Promise<TransactionResult>;

  /**
   * Update page content
   * @param authorCapId - Author capability object ID
   * @param pageId - Page metadata object ID
   * @param newWalrusBlobId - New content BLOB ID
   * @returns Transaction result
   */
  updatePageContent(
    authorCapId: string,
    pageId: string,
    newWalrusBlobId: string
  ): Promise<TransactionResult>;

  /**
   * Delete a page (soft delete)
   * @param authorCapId - Author capability object ID
   * @param pageId - Page metadata object ID
   * @returns Transaction result
   */
  deletePage(
    authorCapId: string,
    pageId: string
  ): Promise<TransactionResult>;

  /**
   * Grant author capability to an address
   * @param adminCapId - Admin capability object ID
   * @param recipientAddress - Address to receive capability
   * @returns Transaction result
   */
  grantAuthorCapability(
    adminCapId: string,
    recipientAddress: string
  ): Promise<TransactionResult>;

  /**
   * Get page metadata
   * @param pageId - Page object ID
   * @returns Page metadata
   */
  getPageMetadata(pageId: string): Promise<PageMetadata>;

  /**
   * Get registry stats
   * @param registryId - Registry object ID
   * @returns Registry statistics
   */
  getRegistryStats(registryId: string): Promise<RegistryStats>;

  /**
   * Get all page IDs from registry
   * @param registryId - Registry object ID
   * @returns Array of page object IDs
   */
  getAllPages(registryId: string): Promise<string[]>;
}

export interface TransactionResult {
  success: boolean;
  txHash: string;
  error?: string;
}

export interface PageMetadata {
  pageId: number;
  walrusBlobId: string;
  version: number;
  author: string;
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
}

export interface RegistryStats {
  totalPages: number;
  createdAt: number;
}

export type BlockchainProvider = 'mock' | 'sui';

