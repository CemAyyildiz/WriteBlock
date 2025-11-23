/**
 * Walrus Storage Implementation
 * Direct HTTP API integration (no SDK to avoid systemObjectId issues)
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

      // API route - Walrus Sites'ta Vercel backend'e yönlendir
      const apiBase = typeof window !== 'undefined' && 
        (window.location.hostname.includes('walrus.site') || 
         window.location.hostname.includes('walrus.space') ||
         window.location.hostname.includes('trwal.app'))
        ? 'https://write-block.vercel.app'
        : '';
      const response = await fetch(`${apiBase}/api/walrus/upload`, {
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
   * Download content from Walrus storage via API route
   * API route alternatif aggregator endpoint'lerini dener
   * @param blobId - Blob ID to download
   * @returns Content as string
   */
  async download(blobId: string): Promise<string> {
    try {
      console.log('🐋 Downloading via API route:', blobId);
      
      // API route - Walrus Sites'ta Vercel backend'e yönlendir
      const apiBase = typeof window !== 'undefined' && 
        (window.location.hostname.includes('walrus.site') || 
         window.location.hostname.includes('walrus.space') ||
         window.location.hostname.includes('trwal.app'))
        ? 'https://write-block.vercel.app'
        : '';
      const response = await fetch(`${apiBase}/api/walrus/download?blobId=${encodeURIComponent(blobId)}`, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain, */*',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(`API download failed: ${errorData.error || response.statusText}`);
      }

      const content = await response.text();
      console.log('✅ Download successful, size:', content.length);
      return content;
    } catch (error: any) {
      console.error('❌ Walrus download failed:', error);
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
        createdAt: Date.now(), // Walrus doesn't provide this, using current time
        contentType,
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

