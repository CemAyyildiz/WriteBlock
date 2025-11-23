'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ArticleHeader from '@/components/article/ArticleHeader';
import ArticleContent from '@/components/article/ArticleContent';
import ProvenanceSection from '@/components/article/ProvenanceSection';
import EditRequestModal from '@/components/article/EditRequestModal';
import { getBlockchainClient, getStorageClient, initializeSuiWallet } from '@/lib/client';
import { PageMetadata } from '@/types';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';

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
      <div className="min-h-screen bg-white flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <div className="max-w-3xl mx-auto px-6 py-24 text-center">
            <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-6 text-sm text-gray-500">Loading story...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-white flex">
        <Sidebar />
        <div className="flex-1 ml-64">
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
      </div>
    );
  }

  const isAuthor = currentAccount && page.author.toLowerCase() === currentAccount.address.toLowerCase();
  const canSuggestEdit = currentAccount && !isAuthor;

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />

      <main className="flex-1 ml-64">
        <article className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
          <ArticleHeader
            title={page.title || `Article #${page.page_id}`}
            author={page.author}
            updatedAt={page.updated_at}
            version={page.version}
            onBack={() => router.push('/')}
          />

          <ArticleContent content={content} />

          {/* Suggest Edit Button */}
          {canSuggestEdit && (
            <div className="mb-16 pb-16 border-b border-gray-200">
              <button
                onClick={handleOpenEditRequest}
                className="px-6 py-3 border border-gray-900 text-gray-900 rounded-full font-medium hover:bg-gray-50 transition-colors duration-200 inline-flex items-center gap-2"
              >
                <span>✏️</span>
                <span>Suggest an edit</span>
              </button>
            </div>
          )}

          <ProvenanceSection
            pageId={page.page_id}
            version={page.version}
            walrusBlobId={page.walrus_blob_id}
            author={page.author}
          />

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
      </main>

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
    </div>
  );
}
