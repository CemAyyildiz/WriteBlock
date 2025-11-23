'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import LoadingState from '@/components/home/LoadingState';
import ErrorState from '@/components/home/ErrorState';
import HeaderSection from '@/components/home/HeaderSection';
import StatsGrid from '@/components/home/StatsGrid';
import ArticlesList from '@/components/home/ArticlesList';
import InfoSection from '@/components/home/InfoSection';
import { getBlockchainClient, getStorageClient, getProviderConfig } from '@/lib/client';
import { PageMetadata } from '@/types';

export default function Dashboard() {
  const [pages, setPages] = useState<PageMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const config = getProviderConfig();

  // Fetch all pages from blockchain
  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        setError(null);

        const blockchainClient = getBlockchainClient();
        const registryId = process.env.NEXT_PUBLIC_REGISTRY_ID;

        if (!registryId) {
          throw new Error('Registry ID not configured');
        }

        // Get all page IDs from registry
        const pageIds = await blockchainClient.getAllPages(registryId);
        console.log('📚 Found pages:', pageIds.length);

        // Fetch metadata for each page
        const pagesData: PageMetadata[] = [];
        const storageClient = getStorageClient();

        for (const pageId of pageIds) {
          try {
            const metadata = await blockchainClient.getPageMetadata(pageId);
            
            // Skip deleted pages
            if (metadata.deleted) {
              continue;
            }
            
            // Try to fetch content from Walrus to extract title, excerpt, and slug
            let title = `Article #${metadata.pageId}`;
            let excerpt = `Published on ${new Date(metadata.updatedAt).toLocaleDateString()} • Stored on Walrus`;
            let slug = `page-${metadata.pageId}`;
            
            try {
              console.log(`🐋 Fetching content for page ${metadata.pageId} from Walrus:`, metadata.walrusBlobId);
              const blobContent = await storageClient.download(metadata.walrusBlobId);
              
              // Try to parse as JSON (new format) or use as markdown (old format)
              let blobData: any;
              let markdownContent: string;
              try {
                blobData = JSON.parse(blobContent);
                markdownContent = blobData.content || blobContent;
                title = blobData.title || title;
                excerpt = blobData.excerpt || excerpt;
                slug = blobData.slug || slug;
              } catch {
                // Old format - just markdown, extract from content
                markdownContent = blobContent;
                const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
                if (titleMatch) {
                  title = titleMatch[1];
                }
                
                // Create excerpt (first paragraph after title)
                const contentWithoutTitle = markdownContent.replace(/^#\s+.+$/m, '').trim();
                const lines = contentWithoutTitle.split('\n').filter(line => line.trim());
                const firstParagraph = lines[0] || '';
                excerpt = firstParagraph.substring(0, 150) + (firstParagraph.length > 150 ? '...' : '');
              }
              
              console.log(`✅ Content loaded for page ${metadata.pageId}:`, title, `(slug: ${slug})`);
            } catch (walrusErr: any) {
              console.warn(`⚠️ Failed to fetch Walrus content for page ${metadata.pageId}:`, walrusErr?.message || walrusErr);
              console.warn(`   Blob ID: ${metadata.walrusBlobId}`);
              
              // 404 hatası ise blob henüz replicate olmamış olabilir
              if (walrusErr?.message?.includes('404') || walrusErr?.message?.includes('not found')) {
                excerpt = `⏳ Content is being replicated to Walrus network... • Blob ID: ${metadata.walrusBlobId.substring(0, 20)}...`;
              } else {
                excerpt = `📦 Blob ID: ${metadata.walrusBlobId.substring(0, 20)}... • Click to load content`;
              }
              // Use fallback title and excerpt
            }
            
            // Create page metadata with slug
            const pageData: PageMetadata = {
              page_id: metadata.pageId,
              walrus_blob_id: metadata.walrusBlobId,
              version: metadata.version,
              author: metadata.author,
              created_at: metadata.createdAt,
              updated_at: metadata.updatedAt,
              slug,
              title,
              excerpt,
            };
            
            pagesData.push(pageData);
          } catch (err) {
            console.warn(`Failed to fetch page ${pageId}:`, err);
          }
        }

        // Sort by updated_at (newest first)
        pagesData.sort((a, b) => b.updated_at - a.updated_at);
        
        setPages(pagesData);
      } catch (err: any) {
        console.error('Error fetching pages:', err);
        setError(err.message || 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-off-white dark:bg-navy-950">
        <Navbar />
        <LoadingState />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-off-white dark:bg-navy-950">
        <Navbar />
        <ErrorState error={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white dark:bg-navy-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <HeaderSection totalPages={pages.length} />
        <StatsGrid />
        <ArticlesList pages={pages} />
        <InfoSection />
      </div>
    </div>
  );
}
