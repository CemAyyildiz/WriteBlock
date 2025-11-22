'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-off-white dark:bg-navy-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="inline-block w-16 h-16 border-4 border-navy-600 border-t-neon-green rounded-full animate-spin"></div>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 font-medium">
            Loading articles from blockchain...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-off-white dark:bg-navy-950">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="text-7xl mb-6">⚠️</div>
          <h2 className="text-3xl font-bold text-navy-800 dark:text-navy-200 mb-4">
            Failed to Load Articles
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="modern-button inline-flex items-center gap-2"
          >
            <span>🔄</span>
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white dark:bg-navy-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-end justify-between">
            <div>
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-navy-100 to-navy-50 dark:from-navy-900 dark:to-navy-800 border border-navy-200 dark:border-navy-700">
                <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
                <span className="text-sm font-semibold text-navy-700 dark:text-navy-300">Live on Sui Blockchain</span>
              </div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-navy-800 to-navy-600 dark:from-navy-200 dark:to-navy-400 bg-clip-text text-transparent">
                Published Articles
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Decentralized content powered by Walrus storage
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold bg-gradient-to-br from-neon-green to-neon-cyan bg-clip-text text-transparent mb-1">
                {pages.length}
              </div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Total Posts
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="glass-card p-6 group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-navy-500 to-navy-700 shadow-lg group-hover:shadow-navy-500/50 transition-shadow">
                <span className="text-2xl">⛓️</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Blockchain</div>
                <div className="font-bold text-xl text-navy-700 dark:text-navy-300">Sui Network</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
                <span className="text-2xl">🐋</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Storage</div>
                <div className="font-bold text-xl text-navy-700 dark:text-navy-300">Walrus</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-neon-green to-neon-cyan shadow-lg group-hover:shadow-neon-green/50 transition-shadow">
                <span className="text-2xl">✍️</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active Authors</div>
                <div className="font-bold text-xl text-navy-700 dark:text-navy-300">2 Writers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="space-y-6">
          {pages.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <div className="text-7xl mb-6 opacity-50">📝</div>
              <h3 className="text-2xl font-bold text-navy-700 dark:text-navy-300 mb-3">
                No articles yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Start creating content with the decentralized CMS
              </p>
              <Link
                href="/author"
                className="modern-button inline-flex items-center gap-2"
              >
                <span>Create First Article</span>
                <span>→</span>
              </Link>
            </div>
          ) : (
            pages.map((page) => (
              <Link
                key={page.page_id}
                href={`/${page.slug}`}
                className="block group"
              >
                <article className="glass-card p-8 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-navy-500/5 to-neon-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 pr-6">
                        <h2 className="text-3xl font-bold mb-3 text-navy-800 dark:text-navy-100 group-hover:text-navy-600 dark:group-hover:text-neon-green transition-colors">
                          {page.title}
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                          {page.excerpt}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-navy-100 to-navy-200 dark:from-navy-800 dark:to-navy-700 group-hover:shadow-xl transition-shadow">
                          <span className="text-3xl">📄</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-navy-600 dark:text-navy-400">👤</span>
                          <span>{formatAddress(page.author)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-navy-600 dark:text-navy-400">📅</span>
                          <span>{formatDate(page.updated_at)}</span>
                        </div>
                        <div className="provenance-chip">
                          v{page.version}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 font-semibold text-navy-600 dark:text-neon-green group-hover:gap-4 transition-all">
                        <span>Read More</span>
                        <span>→</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))
          )}
        </div>

        {/* Info Section */}
        <div className="mt-16 glass-card p-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 flex items-center justify-center border border-neon-green/30">
              <span className="text-3xl">ℹ️</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-navy-800 dark:text-navy-200 mb-3">
                Decentralized Content Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                All articles on this platform are stored with metadata on the Sui blockchain and content on 
                Walrus distributed storage. This ensures permanent, censorship-resistant publishing.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-700 transition-colors"
                >
                  <span>👑</span>
                  <span>Admin Panel</span>
                </Link>
                <Link
                  href="/author"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-700 transition-colors"
                >
                  <span>✍️</span>
                  <span>Author Panel</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
