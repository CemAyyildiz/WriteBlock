'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dynamic from 'next/dynamic';
import 'easymde/dist/easymde.min.css';
import Navbar from '@/components/Navbar';
import { getBlockchainClient, getStorageClient, getWalletClient, initializeSuiWallet, getProviderConfig } from '@/lib/client';
import { PageMetadata } from '@/types';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });

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
  
  // Sui wallet integration
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const config = getProviderConfig();
  
  // Initialize wallet for edit requests
  useEffect(() => {
    if (currentAccount) {
      initializeSuiWallet({
        account: currentAccount,
        connect: async () => {},
        disconnect: async () => {},
        signAndExecute: async (tx) => {
          return new Promise((resolve, reject) => {
            signAndExecuteTransaction(
              { transaction: tx },
              {
                onSuccess: (result) => resolve({ digest: result.digest }),
                onError: (error) => reject(error),
              }
            );
          });
        },
      });
    }
  }, [currentAccount, signAndExecuteTransaction]);

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

  const handleOpenEditRequest = () => {
    if (!currentAccount) {
      alert('Please connect your wallet first to suggest edits');
      return;
    }
    setEditRequestContent(content); // Pre-fill with current content
    setShowEditRequestModal(true);
  };

  const handleSubmitEditRequest = async () => {
    if (!page || !editRequestContent.trim()) {
      alert('Please provide edited content');
      return;
    }

    if (!currentAccount) {
      alert('Please connect your wallet first');
      return;
    }

    setIsSubmittingRequest(true);

    try {
      const blockchainClient = getBlockchainClient();
      const storageClient = getStorageClient();
      
      // Get page object ID from registry
      const registryId = process.env.NEXT_PUBLIC_REGISTRY_ID;
      if (!registryId) {
        throw new Error('Registry ID not configured');
      }
      
      const pageIds = await blockchainClient.getAllPages(registryId);
      let pageObjectId: string | null = null;
      
      for (const pageId of pageIds) {
        const metadata = await blockchainClient.getPageMetadata(pageId);
        if (metadata.pageId === page.page_id) {
          pageObjectId = pageId;
          break;
        }
      }
      
      if (!pageObjectId) {
        throw new Error('Page object ID not found');
      }

      // Create JSON blob with edited content (preserve title, slug, excerpt from original)
      const blobData = {
        slug: page.slug || `page-${page.page_id}`,
        title: page.title || `Article #${page.page_id}`,
        excerpt: page.excerpt || '',
        content: editRequestContent,
      };
      
      // Upload edited content to Walrus
      const newWalrusBlobId = await storageClient.upload(JSON.stringify(blobData));
      console.log('✅ Edit request content uploaded:', newWalrusBlobId);
      
      // Create edit request on blockchain
      const txResult = await blockchainClient.createEditRequest(
        pageObjectId,
        newWalrusBlobId
      );
      
      if (!txResult.success) {
        throw new Error(txResult.error || 'Failed to create edit request');
      }
      
      console.log('✅ Edit request created:', txResult.txHash);
      
      alert('✅ Edit request submitted successfully! The author will review it.');
      setShowEditRequestModal(false);
      setEditRequestContent('');
    } catch (error) {
      console.error('Error submitting edit request:', error);
      alert('Failed to submit edit request: ' + (error as Error).message);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const editorOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: 'Edit the content...',
      status: ['lines', 'words', 'cursor'] as any,
      autofocus: true,
      toolbar: [
        'bold',
        'italic',
        'heading',
        '|',
        'quote',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'image',
        '|',
        'preview',
        'side-by-side',
        'fullscreen',
        '|',
        'guide',
      ] as any,
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-sm text-gray-500">
            Loading story...
          </p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <p className="text-4xl mb-4">📚</p>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            {error ? 'Failed to Load Story' : 'Story Not Found'}
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-md mx-auto leading-relaxed">
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
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <article className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-12 text-gray-600 hover:text-gray-900 transition-colors duration-200 inline-flex items-center gap-2"
        >
          <span>←</span>
          <span className="text-sm">Back</span>
        </button>

        {/* Article Header */}
        <header className="mb-12">
          <h1 className="text-5xl sm:text-6xl font-serif font-bold text-gray-900 mb-8 leading-tight">
            {page.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 border-t border-b border-gray-200 py-4">
            <div className="flex items-center gap-2">
              <span>By</span>
              <span className="font-mono text-xs">{formatAddress(page.author)}</span>
            </div>
            <span>•</span>
            <time dateTime={new Date(page.updated_at).toISOString()}>
              {formatDate(page.updated_at)}
            </time>
            <span>•</span>
            <span className="text-gray-400">v{page.version}</span>
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-16">
          <div className="text-xl leading-relaxed text-gray-800 [&>h1]:text-4xl [&>h1]:font-serif [&>h1]:font-bold [&>h1]:mt-12 [&>h1]:mb-6 [&>h1]:leading-tight [&>h2]:text-3xl [&>h2]:font-serif [&>h2]:font-bold [&>h2]:mt-10 [&>h2]:mb-5 [&>h3]:text-2xl [&>h3]:font-serif [&>h3]:font-bold [&>h3]:mt-8 [&>h3]:mb-4 [&>p]:mb-8 [&>p]:leading-relaxed [&>ul]:mb-8 [&>ol]:mb-8 [&>li]:mb-2 [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:my-8 [&>pre]:bg-gray-50 [&>pre]:border [&>pre]:border-gray-200 [&>pre]:rounded-lg [&>pre]:p-6 [&>pre]:my-8 [&>pre]:overflow-x-auto [&>code]:bg-gray-100 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-base [&>code]:font-mono">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Suggest Edit Button */}
        {page && (
          (() => {
            const isAuthor = currentAccount && page.author.toLowerCase() === currentAccount.address.toLowerCase();
            const shouldShow = currentAccount && !isAuthor;
            
            return shouldShow ? (
              <div className="mb-16 pb-16 border-b border-gray-200">
                <button
                  onClick={handleOpenEditRequest}
                  className="px-6 py-3 border border-gray-900 text-gray-900 rounded-full font-medium hover:bg-gray-50 transition-colors duration-200 inline-flex items-center gap-2"
                >
                  <span>✏️</span>
                  <span>Suggest an edit</span>
                </button>
              </div>
            ) : null;
          })()
        )}

        {/* Provenance Section */}
        <div className="border-t border-gray-200 pt-12 mb-12">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">
            Blockchain Provenance
          </h2>

          <div className="bg-gray-50 rounded-lg p-8 mb-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Page ID
                </div>
                <div className="font-mono text-lg font-bold text-gray-900">
                  #{page.page_id}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Version
                </div>
                <div className="font-mono text-lg font-bold text-gray-900">
                  v{page.version}
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Walrus Blob ID
                </div>
                <div className="font-mono text-sm text-gray-700 break-all">
                  {page.walrus_blob_id}
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Author Address
                </div>
                <div className="font-mono text-sm text-gray-700 break-all">
                  {page.author}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                <span className="text-green-800">✓</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Verified on Blockchain
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  This story is permanently stored on Sui blockchain with content on Walrus decentralized storage. 
                  The author address and version number guarantee authenticity and immutability.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Navigation */}
        <div className="text-center pb-16">
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3.5 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors duration-200 inline-flex items-center gap-2"
          >
            <span>←</span>
            <span>More stories</span>
          </button>
        </div>
      </article>

      {/* Edit Request Modal */}
      {showEditRequestModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Suggest an Edit
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Make your changes below. The author will review your suggestion before publishing.
            </p>
            
            <div className="mb-6">
              <SimpleMDE
                value={editRequestContent}
                onChange={setEditRequestContent}
                options={editorOptions}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowEditRequestModal(false);
                  setEditRequestContent('');
                }}
                disabled={isSubmittingRequest}
                className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-full transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEditRequest}
                disabled={isSubmittingRequest || !editRequestContent.trim()}
                className="flex-1 px-6 py-3 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmittingRequest ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit suggestion</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
