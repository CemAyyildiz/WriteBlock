/**
 * Custom hooks for page data management
 * Handles fetching, parsing, and managing article pages
 */

import { useState, useCallback } from 'react';
import { getBlockchainClient, getStorageClient } from '@/lib/client';
import { PageMetadata } from '@/types';

/**
 * Parse blob content to extract metadata
 */
function parseBlobContent(blobContent: string, pageId: number) {
  let title = `Article #${pageId}`;
  let excerpt = '';
  let slug = `page-${pageId}`;
  let markdownContent = blobContent;

  try {
    // Try parsing as JSON first (new format)
    const blobData = JSON.parse(blobContent);
    title = blobData.title || title;
    excerpt = blobData.excerpt || excerpt;
    slug = blobData.slug || slug;
    markdownContent = blobData.content || blobContent;
  } catch {
    // Fallback to markdown parsing (old format)
    const titleMatch = blobContent.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1];
    }
    
    const contentWithoutTitle = blobContent.replace(/^#\s+.+$/m, '').trim();
    const firstParagraph = contentWithoutTitle.split('\n\n')[0] || '';
    excerpt = firstParagraph.substring(0, 150) + (firstParagraph.length > 150 ? '...' : '');
    markdownContent = blobContent;
  }

  return { title, excerpt, slug, markdownContent };
}

/**
 * Hook to fetch and manage all pages
 */
export function usePages() {
  const [pages, setPages] = useState<PageMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = useCallback(async (registryId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const blockchainClient = getBlockchainClient();
      const storageClient = getStorageClient();
      const envRegistryId = registryId || process.env.NEXT_PUBLIC_REGISTRY_ID;

      if (!envRegistryId) {
        throw new Error('Registry ID not configured');
      }

      const pageIds = await blockchainClient.getAllPages(envRegistryId);
      const pagesData: PageMetadata[] = [];

      for (const pageId of pageIds) {
        try {
          const metadata = await blockchainClient.getPageMetadata(pageId);
          
          if (metadata.deleted) continue;

          // Parse blob content
          let title = `Article #${metadata.pageId}`;
          let excerpt = `Published on ${new Date(metadata.updatedAt).toLocaleDateString()}`;
          let slug = `page-${metadata.pageId}`;
          let markdownContent = '';

          try {
            const blobContent = await storageClient.download(metadata.walrusBlobId);
            const parsed = parseBlobContent(blobContent, metadata.pageId);
            title = parsed.title;
            excerpt = parsed.excerpt;
            slug = parsed.slug;
            markdownContent = parsed.markdownContent;
          } catch (err) {
            console.warn(`Failed to fetch content for page ${metadata.pageId}:`, err);
            excerpt = 'Content stored on decentralized storage';
          }

          pagesData.push({
            page_id: metadata.pageId,
            walrus_blob_id: metadata.walrusBlobId,
            version: metadata.version,
            author: metadata.author,
            created_at: metadata.createdAt,
            updated_at: metadata.updatedAt,
            slug,
            title,
            excerpt,
            markdown_content: markdownContent,
          });
        } catch (err) {
          console.warn(`Failed to fetch page ${pageId}:`, err);
        }
      }

      pagesData.sort((a, b) => b.updated_at - a.updated_at);
      setPages(pagesData);
      return pagesData;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load articles';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    pages,
    loading,
    error,
    fetchPages,
    setPages,
  };
}

/**
 * Hook to fetch pages for a specific user/author
 */
export function useUserPages() {
  const [pages, setPages] = useState<PageMetadata[]>([]);
  const [pageObjectIds, setPageObjectIds] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPages = useCallback(async (userAddress: string, registryId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const blockchainClient = getBlockchainClient();
      const storageClient = getStorageClient();
      const envRegistryId = registryId || process.env.NEXT_PUBLIC_REGISTRY_ID;

      if (!envRegistryId) {
        throw new Error('Registry ID not configured');
      }

      const pageIds = await blockchainClient.getAllPages(envRegistryId);
      const userPages: PageMetadata[] = [];
      const objectIdsMap = new Map<number, string>();

      for (const pageObjectId of pageIds) {
        try {
          const metadata = await blockchainClient.getPageMetadata(pageObjectId);

          // Filter by author and exclude deleted
          if (
            metadata.author.toLowerCase() !== userAddress.toLowerCase() ||
            metadata.deleted
          ) {
            continue;
          }

          // Store the object ID mapping
          objectIdsMap.set(metadata.pageId, pageObjectId);

          // Parse blob content
          let title = `Article #${metadata.pageId}`;
          let excerpt = 'Click to view content';
          let slug = `page-${metadata.pageId}`;
          let markdownContent = '';

          try {
            const blobContent = await storageClient.download(metadata.walrusBlobId);
            const parsed = parseBlobContent(blobContent, metadata.pageId);
            title = parsed.title;
            excerpt = parsed.excerpt;
            slug = parsed.slug;
            markdownContent = parsed.markdownContent;
          } catch (err) {
            console.warn(`Failed to fetch content for page ${metadata.pageId}:`, err);
          }

          userPages.push({
            page_id: metadata.pageId,
            walrus_blob_id: metadata.walrusBlobId,
            version: metadata.version,
            author: metadata.author,
            created_at: metadata.createdAt,
            updated_at: metadata.updatedAt,
            slug,
            title,
            excerpt,
            markdown_content: markdownContent,
          });
        } catch (err) {
          console.warn(`Failed to fetch page ${pageObjectId}:`, err);
        }
      }

      userPages.sort((a, b) => b.updated_at - a.updated_at);
      setPages(userPages);
      setPageObjectIds(objectIdsMap);
      return userPages;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load user pages';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    pages,
    pageObjectIds,
    loading,
    error,
    fetchUserPages,
    setPages,
  };
}

/**
 * Hook to fetch edit requests for pages
 */
export function useEditRequests() {
  const [editRequests, setEditRequests] = useState<Map<number, any[]>>(new Map());
  const [loading, setLoading] = useState(false);

  const fetchEditRequestsContent = useCallback(async (pageId: number, requests: any[]) => {
    const storageClient = getStorageClient();
    
    const requestsWithContent = await Promise.all(
      requests.map(async (req) => {
        try {
          if (!req.newWalrusBlobId || req.newWalrusBlobId.trim() === '') {
            return { ...req, requester: req.requester || 'Unknown' };
          }
          
          const blobContent = await storageClient.download(req.newWalrusBlobId);
          const blobData = JSON.parse(blobContent);
          
          return {
            ...req,
            requester: req.requester || 'Unknown',
            title: blobData.title,
            slug: blobData.slug,
            excerpt: blobData.excerpt,
            content: blobData.content,
          };
        } catch (error) {
          return { ...req, requester: req.requester || 'Unknown' };
        }
      })
    );

    setEditRequests((prev) => {
      const newMap = new Map(prev);
      newMap.set(pageId, requestsWithContent);
      return newMap;
    });

    return requestsWithContent;
  }, []);

  return {
    editRequests,
    loading,
    fetchEditRequestsContent,
    setEditRequests,
  };
}

