/**
 * Mock Storage Implementation
 * Simulates Walrus storage for development and testing
 */

import { IStorageClient, BlobMetadata } from '../interfaces/storage.interface';

export class MockStorageClient implements IStorageClient {
  private storage = new Map<string, { content: string; metadata: BlobMetadata }>();

  async upload(content: string | Blob): Promise<string> {
    // Simulate network delay
    await this.delay(800);

    // Generate mock BLOB ID
    const blobId = this.generateBlobId();
    
    // Store content
    const contentStr = content instanceof Blob ? await content.text() : content;
    const metadata: BlobMetadata = {
      blobId,
      size: contentStr.length,
      createdAt: Date.now(),
      contentType: content instanceof Blob ? content.type : 'text/markdown',
    };

    this.storage.set(blobId, { content: contentStr, metadata });

    console.log(`[Mock Storage] Uploaded BLOB: ${blobId}`);
    return blobId;
  }

  async download(blobId: string): Promise<string> {
    // Simulate network delay
    await this.delay(500);

    const data = this.storage.get(blobId);
    if (!data) {
      throw new Error(`BLOB not found: ${blobId}`);
    }

    console.log(`[Mock Storage] Downloaded BLOB: ${blobId}`);
    return data.content;
  }

  async exists(blobId: string): Promise<boolean> {
    await this.delay(200);
    return this.storage.has(blobId);
  }

  async getMetadata(blobId: string): Promise<BlobMetadata> {
    await this.delay(200);
    
    const data = this.storage.get(blobId);
    if (!data) {
      throw new Error(`BLOB not found: ${blobId}`);
    }

    return data.metadata;
  }

  private generateBlobId(): string {
    return `mock_walrus_blob_${Math.random().toString(36).substring(2, 15)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

