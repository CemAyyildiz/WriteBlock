/**
 * Storage Interface - Abstraction for content storage
 * Implementations: Mock, Walrus
 */

export interface IStorageClient {
  /**
   * Upload content and get BLOB ID
   * @param content - The content to upload (markdown, image, etc.)
   * @returns BLOB ID string
   */
  upload(content: string | Blob): Promise<string>;

  /**
   * Download content by BLOB ID
   * @param blobId - The BLOB identifier
   * @returns Content as string
   */
  download(blobId: string): Promise<string>;

  /**
   * Check if BLOB exists
   * @param blobId - The BLOB identifier
   * @returns Boolean indicating existence
   */
  exists(blobId: string): Promise<boolean>;

  /**
   * Get BLOB metadata
   * @param blobId - The BLOB identifier
   * @returns Metadata object
   */
  getMetadata(blobId: string): Promise<BlobMetadata>;
}

export interface BlobMetadata {
  blobId: string;
  size: number;
  createdAt: number;
  contentType?: string;
}

export type StorageProvider = 'mock' | 'walrus';

