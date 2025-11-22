'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from '@/components/Navbar';
import { getBlockchainClient, getStorageClient } from '@/lib/client';
import { PageMetadata } from '@/types';

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [page, setPage] = useState<PageMetadata | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Reserved routes that cannot be used as article slugs
        const reservedRoutes = ['author', 'admin', 'api', '_next', 'favicon.ico'];
        if (reservedRoutes.includes(slug.toLowerCase())) {
          setError('This route is reserved and cannot be used as an article slug');
          setLoading(false);
          router.push('/');
          return;
        }

        const blockchainClient = getBlockchainClient();
        const storageClient = getStorageClient();
        const registryId = process.env.NEXT_PUBLIC_REGISTRY_ID;

        if (!registryId) {
          throw new Error('Registry ID not configured');
        }

        // Get all page IDs from registry
        const pageIds = await blockchainClient.getAllPages(registryId);
        
        // Try to find page by slug - search through all pages
        let foundPage: { metadata: any; content: string; blobData: any } | null = null;
        
        // First, try to match by page-{id} format for backward compatibility
        const pageIdMatch = slug.match(/page-(\d+)/);
        if (pageIdMatch) {
          const pageId = parseInt(pageIdMatch[1]);
          if (pageId < pageIds.length) {
            const pageObjectId = pageIds[pageId];
            const metadata = await blockchainClient.getPageMetadata(pageObjectId);
            
            // Skip deleted pages
            if (!metadata.deleted) {
              const blobContent = await storageClient.download(metadata.walrusBlobId);
              
              // Try to parse as JSON (new format) or use as markdown (old format)
              let blobData: any;
              let markdownContent: string;
              try {
                blobData = JSON.parse(blobContent);
                markdownContent = blobData.content || blobContent;
              } catch {
                // Old format - just markdown
                blobData = { slug: `page-${pageId}`, title: `Article #${pageId}`, excerpt: '', content: blobContent };
                markdownContent = blobContent;
              }
              
              foundPage = { metadata, content: markdownContent, blobData };
            }
          }
        } else {
          // Search by slug - iterate through all pages
          for (let i = 0; i < pageIds.length; i++) {
            try {
              const pageObjectId = pageIds[i];
              const metadata = await blockchainClient.getPageMetadata(pageObjectId);
              
              // Skip deleted pages
              if (metadata.deleted) {
                continue;
              }
              
              const blobContent = await storageClient.download(metadata.walrusBlobId);
              
              // Try to parse as JSON (new format) or use as markdown (old format)
              let blobData: any;
              try {
                blobData = JSON.parse(blobContent);
                if (blobData.slug === slug) {
                  foundPage = { 
                    metadata, 
                    content: blobData.content || blobContent, 
                    blobData 
                  };
                  break;
                }
              } catch {
                // Old format - skip (no slug match)
                continue;
              }
            } catch (err: any) {
              // 404 hatası ise blob henüz replicate olmamış olabilir, skip et
              if (err?.message?.includes('404') || err?.message?.includes('not found')) {
                console.warn(`⚠️ Blob not yet replicated for page ${i}, skipping...`);
              } else {
                console.warn(`Failed to check page ${i}:`, err);
              }
              continue;
            }
          }
        }

        if (!foundPage) {
          setError('Page not found');
          setLoading(false);
          return;
        }

        const { metadata, content: markdownContent, blobData } = foundPage;

        // Extract title and excerpt from blobData (new format) or markdown (old format)
        const title = blobData.title || (() => {
          const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
          return titleMatch ? titleMatch[1] : `Article #${metadata.pageId}`;
        })();

        const excerpt = blobData.excerpt || (() => {
          const contentWithoutTitle = markdownContent.replace(/^#\s+.+$/m, '').trim();
          const firstParagraph = contentWithoutTitle.split('\n\n')[0];
          return firstParagraph.substring(0, 200) + (firstParagraph.length > 200 ? '...' : '');
        })();

        setPage({
          page_id: metadata.pageId,
          walrus_blob_id: metadata.walrusBlobId,
          version: metadata.version,
          author: metadata.author,
          created_at: metadata.createdAt,
          updated_at: metadata.updatedAt,
          slug: blobData.slug || `page-${metadata.pageId}`,
          title,
          excerpt,
        });

        setContent(markdownContent);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching page:', err);
        setError(err.message || 'Failed to load article');
        setLoading(false);
      }
    };

    fetchPageContent();
  }, [slug]);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white dark:bg-navy-950">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="inline-block w-16 h-16 border-4 border-navy-600 border-t-neon-green rounded-full animate-spin"></div>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 font-medium">
            Loading article from blockchain and Walrus...
          </p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-off-white dark:bg-navy-950">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="text-8xl mb-8 opacity-50">😕</div>
          <h1 className="text-4xl font-bold text-navy-800 dark:text-navy-200 mb-4">
            {error ? 'Failed to Load Article' : 'Article Not Found'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-md mx-auto">
            {error || "The article you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => router.push('/')}
            className="modern-button inline-flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white dark:bg-navy-950">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-8 inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-700 transition-all hover:gap-3"
        >
          <span>←</span>
          <span>All Articles</span>
        </button>

        {/* Article Header */}
        <header className="mb-12">
          <h1 className="text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-navy-800 to-navy-600 dark:from-navy-100 dark:to-navy-300 bg-clip-text text-transparent">
            {page.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="provenance-chip">
              <span className="text-navy-700 dark:text-navy-300">👤</span>
              <span>{formatAddress(page.author)}</span>
            </div>
            <div className="provenance-chip">
              <span className="text-navy-700 dark:text-navy-300">📅</span>
              <span>{formatDate(page.updated_at)}</span>
            </div>
            <div className="provenance-chip">
              <span className="text-navy-700 dark:text-navy-300">🔢</span>
              <span>Version {page.version}</span>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="glass-card mb-12 overflow-hidden">
          <div className="p-12 lg:p-16">
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </article>

        {/* Provenance Footer - Blockchain Info */}
        <div className="glass-card p-8 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 flex items-center justify-center border border-neon-green/30">
              <span className="text-2xl">🔗</span>
            </div>
            <h2 className="text-2xl font-bold text-navy-800 dark:text-navy-200">
              Blockchain Provenance
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-navy-50 to-navy-100 dark:from-navy-900 dark:to-navy-800">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Page ID
              </div>
              <div className="font-mono text-lg font-bold text-navy-700 dark:text-navy-300">
                #{page.page_id}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-navy-50 to-navy-100 dark:from-navy-900 dark:to-navy-800">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Walrus BLOB ID
              </div>
              <div className="font-mono text-sm text-navy-700 dark:text-navy-300 truncate">
                {page.walrus_blob_id}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-navy-50 to-navy-100 dark:from-navy-900 dark:to-navy-800">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Created On
              </div>
              <div className="text-sm font-medium text-navy-700 dark:text-navy-300">
                {formatDate(page.created_at)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-navy-50 to-navy-100 dark:from-navy-900 dark:to-navy-800">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Author Address
              </div>
              <div className="font-mono text-sm text-navy-700 dark:text-navy-300 truncate">
                {page.author}
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-r from-neon-green/10 to-neon-cyan/10 border border-neon-green/20">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
                <span className="text-xl">✓</span>
              </div>
              <div>
                <h3 className="font-bold text-navy-800 dark:text-navy-200 mb-2">
                  Authenticity Verified
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  This article is stored on the Sui blockchain. The version number and author address guarantee 
                  content authenticity and immutability. Content is permanently stored on Walrus distributed storage.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="modern-button inline-flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to All Articles</span>
          </button>
        </div>
      </div>
    </div>
  );
}
