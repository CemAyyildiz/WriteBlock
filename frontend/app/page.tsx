'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/home/HeroSection';
import ArticleListItem from '@/components/home/ArticleListItem';
import EmptyArticlesState from '@/components/home/EmptyArticlesState';
import FooterCTA from '@/components/home/FooterCTA';
import { getBlockchainClient, getStorageClient } from '@/lib/client';
import { PageMetadata } from '@/types';

export default function Dashboard() {
  const [pages, setPages] = useState<PageMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const pageIds = await blockchainClient.getAllPages(registryId);
        const pagesData: PageMetadata[] = [];
        const storageClient = getStorageClient();

        for (const pageId of pageIds) {
          try {
            const metadata = await blockchainClient.getPageMetadata(pageId);
            if (metadata.deleted) continue;
            
            let title = `Article #${metadata.pageId}`;
            let excerpt = `Published on ${new Date(metadata.updatedAt).toLocaleDateString()}`;
            let slug = `page-${metadata.pageId}`;
            
            try {
              const blobContent = await storageClient.download(metadata.walrusBlobId);
              try {
                const blobData = JSON.parse(blobContent);
                title = blobData.title || title;
                excerpt = blobData.excerpt || excerpt;
                slug = blobData.slug || slug;
              } catch {
                const markdownContent = blobContent;
                const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
                if (titleMatch) title = titleMatch[1];
                
                const contentWithoutTitle = markdownContent.replace(/^#\s+.+$/m, '').trim();
                const lines = contentWithoutTitle.split('\n').filter(line => line.trim());
                const firstParagraph = lines[0] || '';
                excerpt = firstParagraph.substring(0, 200) + (firstParagraph.length > 200 ? '...' : '');
              }
            } catch {
              excerpt = `Content stored on decentralized storage`;
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
            });
          } catch (err) {
            console.warn(`Failed to fetch page ${pageId}:`, err);
          }
        }

        pagesData.sort((a, b) => b.updated_at - a.updated_at);
        setPages(pagesData);
      } catch (err: any) {
        setError(err.message || 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500">Loading stories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center max-w-md px-4">
            <p className="text-4xl mb-4">📚</p>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <HeroSection />

      {/* Articles List */}
      {pages.length > 0 ? (
        <>
          <section className="py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
              <div className="space-y-12">
                {pages.map((article) => (
                  <ArticleListItem key={article.page_id} article={article} />
                ))}
              </div>
            </div>
          </section>
          
          <FooterCTA totalStories={pages.length} />
        </>
      ) : (
        <EmptyArticlesState />
      )}
    </div>
  );
}
