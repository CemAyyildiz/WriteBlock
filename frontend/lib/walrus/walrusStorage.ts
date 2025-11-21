/**
 * Walrus Storage Implementation
 * Real Walrus Testnet integration
 */

import { IStorageClient, BlobMetadata } from '../interfaces/storage.interface';

export class WalrusStorageClient implements IStorageClient {
  private publisherUrl: string;
  private aggregatorUrl: string;
  private aggregatorUrlFallback?: string;

  constructor() {
    this.publisherUrl = process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space';
    this.aggregatorUrl = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space';
    this.aggregatorUrlFallback = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL_FALLBACK;
  }

  /**
   * Upload content to Walrus storage via API route
   * @param content - String or Blob to upload
   * @returns Blob ID
   */
  async upload(content: string | Blob): Promise<string> {
    try {
      console.log('📤 Uploading via API route...');

      // Convert content to string for API route
      let bodyContent: string;
      if (typeof content === 'string') {
        bodyContent = content;
      } else {
        // Convert Blob to text
        bodyContent = await content.text();
      }

      // API route'a POST request (CORS problemi yok!)
      const response = await fetch('/api/walrus/upload', {
        method: 'POST',
        body: bodyContent,
        headers: {
          'Content-Type': 'text/plain',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API upload failed: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.blobId) {
        throw new Error('Invalid API response format');
      }

      console.log('✅ Walrus upload successful:', result.blobId);
      return result.blobId;
    } catch (error: any) {
      console.error('Error uploading to Walrus:', error);
      throw new Error(`Failed to upload to Walrus: ${error.message}`);
    }
  }

  /**
   * Download content from Walrus storage
   * @param blobId - Blob ID to download
   * @returns Content as string
   */
  async download(blobId: string): Promise<string> {
    try {
      // Try primary aggregator
      let response = await fetch(`${this.aggregatorUrl}/v1/${blobId}`);
      
      // Try fallback aggregator if primary fails
      if (!response.ok && this.aggregatorUrlFallback) {
        console.warn('Primary aggregator failed, trying fallback...');
        response = await fetch(`${this.aggregatorUrlFallback}/v1/${blobId}`);
      }

      if (!response.ok) {
        throw new Error(`Walrus download failed: ${response.status}`);
      }

      const content = await response.text();
      return content;
    } catch (error: any) {
      console.error('Error downloading from Walrus:', error);
      throw new Error(`Failed to download from Walrus: ${error.message}`);
    }
  }

  /**
   * Check if blob exists in Walrus
   * @param blobId - Blob ID to check
   * @returns true if exists
   */
  async exists(blobId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.aggregatorUrl}/v1/${blobId}`, {
        method: 'HEAD',
      });
      return response.ok;
    } catch (error) {
      console.error('Error checking Walrus blob existence:', error);
      return false;
    }
  }

  /**
   * Get blob metadata from Walrus
   * @param blobId - Blob ID
   * @returns Metadata
   */
  async getMetadata(blobId: string): Promise<BlobMetadata> {
    try {
      const response = await fetch(`${this.aggregatorUrl}/v1/${blobId}`, {
        method: 'HEAD',
      });

      if (!response.ok) {
        throw new Error(`Failed to get metadata: ${response.status}`);
      }

      const size = parseInt(response.headers.get('content-length') || '0');
      const contentType = response.headers.get('content-type') || 'application/octet-stream';

      return {
        blobId,
        size,
        contentType,
        uploadedAt: Date.now(), // Walrus doesn't provide this, using current time
      };
    } catch (error: any) {
      console.error('Error getting Walrus metadata:', error);
      throw new Error(`Failed to get metadata: ${error.message}`);
    }
  }

  /**
   * Get storage info (for debugging)
   */
  getStorageInfo() {
    return {
      publisherUrl: this.publisherUrl,
      aggregatorUrl: this.aggregatorUrl,
      aggregatorUrlFallback: this.aggregatorUrlFallback,
    };
  }
}

