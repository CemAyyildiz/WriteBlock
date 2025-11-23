'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import AuthorHeader from '@/components/author/AuthorHeader';
import EditRequestsSection from '@/components/author/EditRequestsSection';
import UserArticlesList from '@/components/author/UserArticlesList';
import EditorForm from '@/components/author/EditorForm';
import EditorSidebar from '@/components/author/EditorSidebar';
import DeleteConfirmModal from '@/components/author/DeleteConfirmModal';
import ViewEditRequestModal from '@/components/author/ViewEditRequestModal';
import { getStorageClient, getBlockchainClient, getWalletClient, initializeSuiWallet, getProviderConfig } from '@/lib/client';
import { PageMetadata } from '@/types';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';

export default function AuthorPage() {
  const router = useRouter();
  const [pages, setPages] = useState<PageMetadata[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  
  // Editor states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [txInfo, setTxInfo] = useState<{ walrusBlobId: string; txHash: string } | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  
  // Edit/Delete states
  const [editingPage, setEditingPage] = useState<PageMetadata | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmPage, setDeleteConfirmPage] = useState<PageMetadata | null>(null);
  
  // Edit Requests states
  const [editRequests, setEditRequests] = useState<Map<number, any[]>>(new Map());
  const [loadingRequests, setLoadingRequests] = useState<Set<number>>(new Set());
  const [processingRequest, setProcessingRequest] = useState<{ pageId: number; requestId: number } | null>(null);
  const [viewingRequest, setViewingRequest] = useState<{ page: PageMetadata; request: any } | null>(null);
  const [loadingRequestContent, setLoadingRequestContent] = useState(false);

  // Sui wallet integration
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [authorCapId, setAuthorCapId] = useState<string | null>(null);
  const [registryId, setRegistryId] = useState<string | null>(null);
  const config = getProviderConfig();

  // Initialize Sui wallet connection
  useEffect(() => {
    if (config.wallet === 'sui' && currentAccount) {
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

      const fetchCapabilities = async () => {
        try {
          const wallet = getWalletClient();
          const caps = await wallet.getUserCapabilities(currentAccount.address);
          
          if (caps.authorCapId) {
            setAuthorCapId(caps.authorCapId);
          } else if (caps.adminCapId) {
            alert('⚠️ You have Admin capability but need Author capability to publish articles.\n\nPlease go to Admin Panel and grant yourself Author capability first!');
          }

          const envRegistryId = process.env.NEXT_PUBLIC_REGISTRY_ID;
          if (envRegistryId) {
            setRegistryId(envRegistryId);
          }

          await fetchUserPages(currentAccount.address);
        } catch (error) {
          console.error('Error fetching capabilities:', error);
        }
      };

      fetchCapabilities();
    }
  }, [currentAccount, signAndExecuteTransaction, config.wallet]);

  // Fetch user's pages
  const fetchUserPages = async (userAddress: string) => {
    try {
      setLoadingPages(true);
      const blockchainClient = getBlockchainClient();
      const envRegistryId = process.env.NEXT_PUBLIC_REGISTRY_ID;

      if (!envRegistryId) {
        console.warn('Registry ID not configured');
        return;
      }

      const pageIds = await blockchainClient.getAllPages(envRegistryId);
      const userPages: PageMetadata[] = [];
      
      for (const pageId of pageIds) {
        try {
          const metadata = await blockchainClient.getPageMetadata(pageId);
          
          if (metadata.author.toLowerCase() === userAddress.toLowerCase() && !metadata.deleted) {
            let title = `Article #${metadata.pageId}`;
            let excerpt = 'Click to view content';
            let slug = `page-${metadata.pageId}`;
            let markdownContent = '';
            
            try {
              const storageClient = getStorageClient();
              const blobContent = await storageClient.download(metadata.walrusBlobId);
              
              try {
                const blobData = JSON.parse(blobContent);
                title = blobData.title || title;
                excerpt = blobData.excerpt || excerpt;
                slug = blobData.slug || slug;
                markdownContent = blobData.content || blobContent;
              } catch {
                const titleMatch = blobContent.match(/^#\s+(.+)$/m);
                if (titleMatch) title = titleMatch[1];
                const contentWithoutTitle = blobContent.replace(/^#\s+.+$/m, '').trim();
                const firstParagraph = contentWithoutTitle.split('\n\n')[0];
                excerpt = firstParagraph ? (firstParagraph.substring(0, 150) + (firstParagraph.length > 150 ? '...' : '')) : excerpt;
                markdownContent = blobContent;
              }
            } catch (err) {
              console.warn(`Failed to fetch content for page ${metadata.pageId}:`, err);
            }
            
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
              markdown_content: markdownContent,
            };
            
            userPages.push(pageData);
            
            try {
              const requests = await blockchainClient.getEditRequests(pageId);
              if (requests.length > 0) {
                await fetchEditRequestsContent(metadata.pageId, requests);
              }
            } catch (err) {
              console.warn(`Failed to fetch edit requests for page ${metadata.pageId}:`, err);
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch page ${pageId}:`, err);
        }
      }

      userPages.sort((a, b) => b.updated_at - a.updated_at);
      setPages(userPages);
    } catch (error) {
      console.error('Error fetching user pages:', error);
    } finally {
      setLoadingPages(false);
    }
  };

  // Fetch edit requests with content
  const fetchEditRequestsContent = async (pageId: number, requests: any[]) => {
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
    
    setEditRequests(prev => {
      const newMap = new Map(prev);
      newMap.set(pageId, requestsWithContent);
      return newMap;
    });
  };

  // Slug validation with debounce
  useEffect(() => {
    if (!slug || editingPage) return;

    const timeoutId = setTimeout(async () => {
      setIsCheckingSlug(true);
      setSlugError(null);

      try {
        const blockchainClient = getBlockchainClient();
        const envRegistryId = process.env.NEXT_PUBLIC_REGISTRY_ID;

        if (!envRegistryId) {
          setIsCheckingSlug(false);
          return;
        }

        const pageIds = await blockchainClient.getAllPages(envRegistryId);

        for (const pageId of pageIds) {
          try {
            const metadata = await blockchainClient.getPageMetadata(pageId);
            if (metadata.deleted) continue;

            const storageClient = getStorageClient();
            const blobContent = await storageClient.download(metadata.walrusBlobId);

            let existingSlug = `page-${metadata.pageId}`;
            try {
              const blobData = JSON.parse(blobContent);
              existingSlug = blobData.slug || existingSlug;
            } catch {
              // Old format, skip
            }

            if (existingSlug === slug) {
              setSlugError('❌ This slug is already in use');
              break;
            }
          } catch (err) {
            console.warn(`Failed to check page ${pageId}:`, err);
          }
        }
      } catch (error) {
        console.error('Error checking slug:', error);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [slug, editingPage]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!editingPage && title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 100);
      setSlug(generatedSlug);
    }
  }, [title, slug, editingPage]);

  const handlePublish = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!slug.trim()) {
      alert('Please enter a slug');
      return;
    }
    if (slugError) {
      alert('Please fix slug error');
      return;
    }
    if (!authorCapId) {
      alert('Author capability not found. Please ensure you have Author capability.');
      return;
    }
    if (!registryId) {
      alert('Registry ID not configured');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setTxInfo(null);

    try {
      const storageClient = getStorageClient();
      const blockchainClient = getBlockchainClient();

      const blobData = {
        slug: slug.trim(),
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content,
      };

      const walrusBlobId = await storageClient.upload(JSON.stringify(blobData));
      console.log('✅ Content uploaded to Walrus:', walrusBlobId);

      const txResult = await blockchainClient.createPage(authorCapId, registryId, walrusBlobId);

      if (!txResult.success) {
        throw new Error(txResult.error || 'Failed to create page');
      }

      console.log('✅ Page created on blockchain:', txResult.txHash);

      setSaveSuccess(true);
      setTxInfo({
        walrusBlobId,
        txHash: txResult.txHash || 'N/A',
      });

      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent('');

      if (currentAccount) {
        await fetchUserPages(currentAccount.address);
      }

      setTimeout(() => {
        setSaveSuccess(false);
        setTxInfo(null);
      }, 10000);
    } catch (error) {
      console.error('Error publishing:', error);
      alert('Failed to publish: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingPage) return;
    if (!title.trim() || !slug.trim()) {
      alert('Please enter title and slug');
      return;
    }
    if (slugError) {
      alert('Please fix slug error');
      return;
    }

    setIsUpdating(true);

    try {
      const storageClient = getStorageClient();
      const blockchainClient = getBlockchainClient();

      const blobData = {
        slug: slug.trim(),
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content,
      };

      const walrusBlobId = await storageClient.upload(JSON.stringify(blobData));
      console.log('✅ Updated content uploaded to Walrus:', walrusBlobId);

      const envRegistryId = process.env.NEXT_PUBLIC_REGISTRY_ID;
      if (!envRegistryId) {
        throw new Error('Registry ID not configured');
      }

      const pageIds = await blockchainClient.getAllPages(envRegistryId);
      let pageObjectId: string | null = null;

      for (const pageId of pageIds) {
        const metadata = await blockchainClient.getPageMetadata(pageId);
        if (metadata.pageId === editingPage.page_id) {
          pageObjectId = pageId;
          break;
        }
      }

      if (!pageObjectId) {
        throw new Error('Page object ID not found');
      }

      if (!authorCapId) {
        throw new Error('Author capability not found');
      }

      const txResult = await blockchainClient.updatePageContent(authorCapId, pageObjectId, walrusBlobId);

      if (!txResult.success) {
        throw new Error(txResult.error || 'Failed to update page');
      }

      console.log('✅ Page updated on blockchain:', txResult.txHash);

      alert('✅ Article updated successfully!');
      
      setEditingPage(null);
      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent('');

      if (currentAccount) {
        await fetchUserPages(currentAccount.address);
      }
    } catch (error) {
      console.error('Error updating:', error);
      alert('Failed to update: ' + (error as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = (page: PageMetadata) => {
    setEditingPage(page);
    setTitle(page.title || '');
    setSlug(page.slug || `page-${page.page_id}`);
    setExcerpt(page.excerpt || '');
    setContent(page.markdown_content || '');
    setSaveSuccess(false);
    setSlugError(null);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingPage(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setSaveSuccess(false);
    setSlugError(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirmPage) return;
    if (!authorCapId) {
      alert('Author capability not found');
      return;
    }

    setIsDeleting(true);

    try {
      const blockchainClient = getBlockchainClient();
      const envRegistryId = process.env.NEXT_PUBLIC_REGISTRY_ID;

      if (!envRegistryId) {
        throw new Error('Registry ID not configured');
      }

      const pageIds = await blockchainClient.getAllPages(envRegistryId);
      let pageObjectId: string | null = null;

      for (const pageId of pageIds) {
        const metadata = await blockchainClient.getPageMetadata(pageId);
        if (metadata.pageId === deleteConfirmPage.page_id) {
          pageObjectId = pageId;
          break;
        }
      }

      if (!pageObjectId) {
        throw new Error('Page object ID not found');
      }

      const txResult = await blockchainClient.deletePage(authorCapId, pageObjectId);

      if (!txResult.success) {
        throw new Error(txResult.error || 'Failed to delete page');
      }

      console.log('✅ Page deleted:', txResult.txHash);
      alert('✅ Article deleted successfully!');

      if (currentAccount) {
        await fetchUserPages(currentAccount.address);
      }

      setDeleteConfirmPage(null);
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete: ' + (error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApproveRequest = async (pageId: number, requestId: number) => {
    if (!authorCapId) {
      alert('Author capability not found');
      return;
    }

    setProcessingRequest({ pageId, requestId });

    try {
      const blockchainClient = getBlockchainClient();
      const envRegistryId = process.env.NEXT_PUBLIC_REGISTRY_ID;

      if (!envRegistryId) {
        throw new Error('Registry ID not configured');
      }

      const pageIds = await blockchainClient.getAllPages(envRegistryId);
      let pageObjectId: string | null = null;

      for (const pid of pageIds) {
        const metadata = await blockchainClient.getPageMetadata(pid);
        if (metadata.pageId === pageId) {
          pageObjectId = pid;
          break;
        }
      }

      if (!pageObjectId) {
        throw new Error('Page object ID not found');
      }

      const txResult = await blockchainClient.approveEditRequest(authorCapId, pageObjectId, requestId);

      if (!txResult.success) {
        throw new Error(txResult.error || 'Failed to approve request');
      }

      console.log('✅ Edit request approved:', txResult.txHash);
      alert('✅ Edit request approved successfully!');

      if (currentAccount) {
        await fetchUserPages(currentAccount.address);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request: ' + (error as Error).message);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (pageId: number, requestId: number) => {
    if (!authorCapId) {
      alert('Author capability not found');
      return;
    }

    setProcessingRequest({ pageId, requestId });

    try {
      const blockchainClient = getBlockchainClient();
      const envRegistryId = process.env.NEXT_PUBLIC_REGISTRY_ID;

      if (!envRegistryId) {
        throw new Error('Registry ID not configured');
      }

      const pageIds = await blockchainClient.getAllPages(envRegistryId);
      let pageObjectId: string | null = null;

      for (const pid of pageIds) {
        const metadata = await blockchainClient.getPageMetadata(pid);
        if (metadata.pageId === pageId) {
          pageObjectId = pid;
          break;
        }
      }

      if (!pageObjectId) {
        throw new Error('Page object ID not found');
      }

      const txResult = await blockchainClient.rejectEditRequest(authorCapId, pageObjectId, requestId);

      if (!txResult.success) {
        throw new Error(txResult.error || 'Failed to reject request');
      }

      console.log('✅ Edit request rejected:', txResult.txHash);
      alert('✅ Edit request rejected.');

      if (currentAccount) {
        await fetchUserPages(currentAccount.address);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request: ' + (error as Error).message);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleViewRequest = async (page: PageMetadata, request: any) => {
    if (!request.content && request.newWalrusBlobId) {
      setLoadingRequestContent(true);
      try {
        const storageClient = getStorageClient();
        const blobContent = await storageClient.download(request.newWalrusBlobId);
        const blobData = JSON.parse(blobContent);
        const updatedRequest = {
          ...request,
          title: blobData.title,
          slug: blobData.slug,
          excerpt: blobData.excerpt,
          content: blobData.content,
        };
        setViewingRequest({ page, request: updatedRequest });
      } catch (error) {
        console.error('Error loading request content:', error);
        alert('Failed to load content: ' + (error as Error).message);
        setViewingRequest({ page, request });
      } finally {
        setLoadingRequestContent(false);
      }
    } else {
      setViewingRequest({ page, request });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!currentAccount) {
    return (
      <>
        <Sidebar />
        <main className="bg-white pt-16 lg:pt-0">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
            <div className="text-center max-w-md mx-auto py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🔒</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600">
                Please connect your Sui wallet to access the author dashboard.
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!authorCapId) {
    return (
      <>
        <Sidebar />
        <main className="bg-white pt-16 lg:pt-0">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
            <div className="text-center max-w-md mx-auto py-20">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Author Capability Required
              </h2>
              <p className="text-gray-600 mb-6">
                You need an Author capability to publish articles. Please contact the admin or visit the Admin Panel to grant yourself this capability.
              </p>
              <button
                onClick={() => router.push('/admin')}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Go to Admin Panel
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="bg-white pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
          <AuthorHeader />

          <EditRequestsSection
            pages={pages}
            editRequests={editRequests}
            loadingRequestContent={loadingRequestContent}
            processingRequest={processingRequest}
            onViewRequest={handleViewRequest}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            formatAddress={formatAddress}
            formatDate={formatDate}
          />

          <UserArticlesList
            pages={pages}
            onEdit={handleEdit}
            onDelete={(page) => setDeleteConfirmPage(page)}
            formatDate={formatDate}
          />

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <EditorForm
                title={title}
                slug={slug}
                excerpt={excerpt}
                content={content}
                slugError={slugError}
                isCheckingSlug={isCheckingSlug}
                isSaving={isSaving}
                saveSuccess={saveSuccess}
                txInfo={txInfo}
                editingPage={editingPage}
                isUpdating={isUpdating}
                currentAccount={currentAccount}
                onTitleChange={setTitle}
                onSlugChange={setSlug}
                onExcerptChange={setExcerpt}
                onContentChange={setContent}
                onPublish={handlePublish}
                onUpdate={handleUpdate}
                onCancelEdit={handleCancelEdit}
              />
            </div>

            <EditorSidebar pages={pages} onEdit={handleEdit} />
          </div>

          <DeleteConfirmModal
            page={deleteConfirmPage}
            isDeleting={isDeleting}
            onConfirm={handleDelete}
            onCancel={() => setDeleteConfirmPage(null)}
          />

          <ViewEditRequestModal
            viewingRequest={viewingRequest}
            onClose={() => setViewingRequest(null)}
            formatAddress={formatAddress}
            formatDate={formatDate}
          />
        </div>
      </main>
    </>
  );
}
