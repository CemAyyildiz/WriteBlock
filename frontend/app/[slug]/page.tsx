'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ArticleHeader from '@/components/article/ArticleHeader';
import ArticleContent from '@/components/article/ArticleContent';
import EditRequestModal from '@/components/article/EditRequestModal';
import LoadingAnimation from '@/components/LoadingAnimation';
import { getBlockchainClient, getStorageClient } from '@/lib/client';
import { PageMetadata } from '@/types';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useWalletCapabilities } from '@/lib/hooks/useWalletCapabilities';
import { formatAddress, formatDate } from '@/lib/utils/format';

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [page, setPage] = useState<PageMetadata | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit request states
  const [showEditRequestModal, setShowEditRequestModal] = useState(false);
  const [editRequestContent, setEditRequestContent] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  
  const currentAccount = useCurrentAccount();
  useWalletCapabilities(); // Initialize wallet connection

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Reserved routes check
        const reservedRoutes = ['author', 'admin', 'api', '_next', 'favicon.ico'];
        if (reservedRoutes.includes(slug.toLowerCase())) {
          setError('This route is reserved');
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

        const pageIds = await blockchainClient.getAllPages(registryId);
        let foundPage: { metadata: any; content: string; blobData: any } | null = null;
        
        // Try to match by page-{id} format
        const pageIdMatch = slug.match(/page-(\d+)/);
        if (pageIdMatch) {
          const pageId = parseInt(pageIdMatch[1]);
          if (pageId < pageIds.length) {
            const pageObjectId = pageIds[pageId];
            const metadata = await blockchainClient.getPageMetadata(pageObjectId);
            
            if (!metadata.deleted) {
              const blobContent = await storageClient.download(metadata.walrusBlobId);
              let blobData: any;
              try {
                blobData = JSON.parse(blobContent);
              } catch {
                blobData = { slug: `page-${pageId}`, title: `Article #${pageId}`, excerpt: '', content: blobContent };
              }
              foundPage = { metadata, content: blobData.content || blobContent, blobData };
            }
          }
        } else {
          // Search by slug
          for (let i = 0; i < pageIds.length; i++) {
            try {
              const pageObjectId = pageIds[i];
              const metadata = await blockchainClient.getPageMetadata(pageObjectId);
              
              if (metadata.deleted) continue;
              
              const blobContent = await storageClient.download(metadata.walrusBlobId);
              try {
                const blobData = JSON.parse(blobContent);
                if (blobData.slug === slug) {
                  foundPage = { 
                    metadata, 
                    content: blobData.content || blobContent, 
                    blobData 
                  };
                  break;
                }
              } catch {
                continue;
              }
            } catch (err: any) {
              if (err?.message?.includes('404') || err?.message?.includes('not found')) {
                console.warn(`Blob not yet replicated for page ${i}`);
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
  }, [slug, router]);

  const handleOpenEditRequest = () => {
    if (!currentAccount) {
      alert('Please connect your wallet first');
      return;
    }
    setEditRequestContent(content);
    setShowEditRequestModal(true);
  };

  const handleSubmitEditRequest = async () => {
    if (!page || !editRequestContent.trim() || !currentAccount) {
      alert('Missing required information');
      return;
    }

    setIsSubmittingRequest(true);

    try {
      const blockchainClient = getBlockchainClient();
      const storageClient = getStorageClient();
      
      const registryId = process.env.NEXT_PUBLIC_REGISTRY_ID;
      if (!registryId) throw new Error('Registry ID not configured');
      
      const pageIds = await blockchainClient.getAllPages(registryId);
      let pageObjectId: string | null = null;
      
      for (const pageId of pageIds) {
        const metadata = await blockchainClient.getPageMetadata(pageId);
        if (metadata.pageId === page.page_id) {
          pageObjectId = pageId;
          break;
        }
      }
      
      if (!pageObjectId) throw new Error('Page object ID not found');

      const blobData = {
        slug: page.slug || `page-${page.page_id}`,
        title: page.title || `Article #${page.page_id}`,
        excerpt: page.excerpt || '',
        content: editRequestContent,
      };
      
      const newWalrusBlobId = await storageClient.upload(JSON.stringify(blobData));
      const txResult = await blockchainClient.createEditRequest(pageObjectId, newWalrusBlobId);
      
      if (!txResult.success) {
        throw new Error(txResult.error || 'Failed to create edit request');
      }
      
      alert('✅ Edit request submitted successfully!');
      setShowEditRequestModal(false);
      setEditRequestContent('');
    } catch (error) {
      console.error('Error submitting edit request:', error);
      alert('Failed to submit edit request: ' + (error as Error).message);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="min-h-screen w-full bg-white flex items-center justify-center pt-16 lg:pt-0">
          <LoadingAnimation message="Loading story..." size="lg" />
        </div>
      </>
    );
  }

  if (error || !page) {
    return (
      <>
        <Sidebar />
        <div className="min-h-screen w-full bg-white flex items-center justify-center pt-16 lg:pt-0">
          <div className="text-center max-w-md px-6">
            <p className="text-4xl mb-4">📚</p>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              {error ? 'Failed to Load Story' : 'Story Not Found'}
            </h1>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              {error || "The story you're looking for doesn't exist or has been removed."}
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-8 py-3.5 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors duration-200"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </>
    );
  }

  const isAuthor = currentAccount && page.author.toLowerCase() === currentAccount.address.toLowerCase();
  const canSuggestEdit = currentAccount && !isAuthor;

  return (
    <>
      <Sidebar />

      <main className="bg-gradient-to-b from-gray-50 to-white min-h-screen pt-16 lg:pt-0">
        {/* Back button - minimal and clean */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-8 lg:pt-12">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900 transition-colors duration-200 inline-flex items-center gap-2 text-sm group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
            <span>Back to articles</span>
          </button>
        </div>

        {/* Two-column layout */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            
            {/* Main content column */}
            <article className="lg:col-span-8 xl:col-span-8">
              {/* Article header */}
              <header className="mb-12 pb-8 border-b-2 border-gray-200">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-gray-900 mb-6 leading-[1.1]">
                  {page.title || `Article #${page.page_id}`}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">By</span>
                    <span className="font-mono text-xs bg-white border border-gray-200 px-3 py-1 rounded-full">
                      {formatAddress(page.author)}
                    </span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <time dateTime={new Date(page.updated_at).toISOString()} className="text-gray-600">
                    {formatDate(page.updated_at)}
                  </time>
                  <span className="text-gray-300">•</span>
                  <span className="font-mono text-xs text-gray-500">v{page.version}</span>
                </div>
              </header>

              {/* Content - Clean and focused */}
              <ArticleContent content={content} />
            </article>

            {/* Right sidebar - All metadata and provenance */}
            <aside className="hidden lg:block lg:col-span-4 xl:col-span-4">
              <div className="sticky top-24 space-y-6">
                
                {/* Article metadata card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                    Article Information
                  </h3>
                  <dl className="space-y-4 text-sm">
                    <div>
                      <dt className="text-gray-500 font-medium mb-1">Page ID</dt>
                      <dd className="font-mono text-gray-900">#{page.page_id}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-1">Version</dt>
                      <dd className="font-mono text-gray-900">v{page.version}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-1">Walrus Blob ID</dt>
                      <dd className="font-mono text-xs text-gray-900 break-all leading-relaxed">
                        {page.walrus_blob_id}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-1">Author</dt>
                      <dd className="font-mono text-xs text-gray-900 break-all">
                        {page.author}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-1">Published</dt>
                      <dd className="text-gray-900">{formatDate(page.created_at)}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 font-medium mb-1">Last Updated</dt>
                      <dd className="text-gray-900">{formatDate(page.updated_at)}</dd>
                    </div>
                  </dl>
                </div>

                {/* Verification badge */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">
                        Verified on Blockchain
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        This article is permanently stored on Walrus decentralized storage and verified on Sui blockchain.
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-blue-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">Storage:</span>
                      <span className="font-mono text-gray-700">Walrus</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">Blockchain:</span>
                      <span className="font-mono text-gray-700">Sui</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {canSuggestEdit && (
                    <button
                      onClick={handleOpenEditRequest}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-900 hover:text-white transition-all duration-200 text-sm inline-flex items-center justify-center gap-2"
                    >
                      <span>✏️</span>
                      <span>Suggest Edit</span>
                    </button>
                  )}
                  <button
                    onClick={() => router.push('/')}
                    className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 text-sm inline-flex items-center justify-center gap-2"
                  >
                    <span>←</span>
                    <span>More Articles</span>
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <EditRequestModal
          isOpen={showEditRequestModal}
          content={editRequestContent}
          isSubmitting={isSubmittingRequest}
          onClose={() => {
            setShowEditRequestModal(false);
            setEditRequestContent('');
          }}
          onContentChange={setEditRequestContent}
          onSubmit={handleSubmitEditRequest}
        />
      </main>
    </>
  );
}
