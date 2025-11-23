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
import Toast from '@/components/Toast';
import { getStorageClient, getBlockchainClient } from '@/lib/client';
import { PageMetadata } from '@/types';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useWalletCapabilities } from '@/lib/hooks/useWalletCapabilities';
import { useUserPages, useEditRequests } from '@/lib/hooks/usePageData';
import { useToast } from '@/lib/hooks/useToast';
import { generateSlug } from '@/lib/utils/format';

export default function AuthorPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { authorCapId, registryId } = useWalletCapabilities();
  const { pages, pageObjectIds, fetchUserPages } = useUserPages();
  const { editRequests, fetchEditRequestsContent } = useEditRequests();
  const { toasts, hideToast, success, error, warning } = useToast();
  
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
  const [processingRequest, setProcessingRequest] = useState<{ pageId: number; requestId: number } | null>(null);
  const [viewingRequest, setViewingRequest] = useState<{ page: PageMetadata; request: any } | null>(null);
  const [loadingRequestContent, setLoadingRequestContent] = useState(false);

  // Fetch user pages on mount and when wallet connects
  useEffect(() => {
    if (currentAccount?.address) {
      fetchUserPages(currentAccount.address);
    }
  }, [currentAccount, fetchUserPages]);

  // Fetch edit requests for all user pages
  useEffect(() => {
    const fetchAllEditRequests = async () => {
      if (pages.length === 0 || pageObjectIds.size === 0) return;

      const blockchainClient = getBlockchainClient();
      
      for (const page of pages) {
        try {
          const pageObjectId = pageObjectIds.get(page.page_id);
          if (!pageObjectId) {
            console.warn(`Page object ID not found for page ${page.page_id}`);
            continue;
          }

          const requests = await blockchainClient.getEditRequests(pageObjectId);
          
          if (requests.length > 0) {
            await fetchEditRequestsContent(page.page_id, requests);
          }
        } catch (err) {
          console.warn(`Failed to fetch edit requests for page ${page.page_id}:`, err);
        }
      }
    };

    fetchAllEditRequests();
  }, [pages, pageObjectIds, fetchEditRequestsContent]);

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
      setSlug(generateSlug(title));
    }
  }, [title, slug, editingPage]);

  const handlePublish = async () => {
    if (!title.trim()) {
      error('Please enter a title');
      return;
    }
    if (!slug.trim()) {
      error('Please enter a slug');
      return;
    }
    if (slugError) {
      error('Please fix slug error');
      return;
    }
    if (!authorCapId) {
      error('Author capability not found. Please ensure you have Author capability.');
      return;
    }
    if (!registryId) {
      error('Registry ID not configured');
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

      if (currentAccount?.address) {
        await fetchUserPages(currentAccount.address);
      }

      setTimeout(() => {
        setSaveSuccess(false);
        setTxInfo(null);
      }, 10000);
    } catch (err) {
      console.error('Error publishing:', err);
      error('Failed to publish: ' + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingPage) return;
    if (!title.trim() || !slug.trim()) {
      error('Please enter title and slug');
      return;
    }
    if (slugError) {
      error('Please fix slug error');
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

      const pageObjectId = pageObjectIds.get(editingPage.page_id);
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

      success('Article updated successfully!');
      
      setEditingPage(null);
      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent('');

      if (currentAccount?.address) {
        await fetchUserPages(currentAccount.address);
      }
    } catch (err) {
      console.error('Error updating:', err);
      error('Failed to update: ' + (err as Error).message);
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
      error('Author capability not found');
      return;
    }

    setIsDeleting(true);

    try {
      const blockchainClient = getBlockchainClient();
      
      const pageObjectId = pageObjectIds.get(deleteConfirmPage.page_id);
      if (!pageObjectId) {
        throw new Error('Page object ID not found');
      }

      const txResult = await blockchainClient.deletePage(authorCapId, pageObjectId);

      if (!txResult.success) {
        throw new Error(txResult.error || 'Failed to delete page');
      }

      console.log('✅ Page deleted:', txResult.txHash);
      success('Article deleted successfully!');

      if (currentAccount?.address) {
        await fetchUserPages(currentAccount.address);
      }

      setDeleteConfirmPage(null);
    } catch (err) {
      console.error('Error deleting:', err);
      error('Failed to delete: ' + (err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApproveRequest = async (pageId: number, requestId: number) => {
    if (!authorCapId) {
      error('Author capability not found');
      return;
    }

    setProcessingRequest({ pageId, requestId });

    try {
      const blockchainClient = getBlockchainClient();
      
      const pageObjectId = pageObjectIds.get(pageId);
      if (!pageObjectId) {
        throw new Error('Page object ID not found');
      }

      const txResult = await blockchainClient.approveEditRequest(authorCapId, pageObjectId, requestId);

      if (!txResult.success) {
        throw new Error(txResult.error || 'Failed to approve request');
      }

      console.log('✅ Edit request approved:', txResult.txHash);
      success('Edit request approved successfully!');

      if (currentAccount?.address) {
        await fetchUserPages(currentAccount.address);
      }
    } catch (err) {
      console.error('Error approving request:', err);
      error('Failed to approve request: ' + (err as Error).message);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (pageId: number, requestId: number) => {
    if (!authorCapId) {
      error('Author capability not found');
      return;
    }

    setProcessingRequest({ pageId, requestId });

    try {
      const blockchainClient = getBlockchainClient();
      
      const pageObjectId = pageObjectIds.get(pageId);
      if (!pageObjectId) {
        throw new Error('Page object ID not found');
      }

      const txResult = await blockchainClient.rejectEditRequest(authorCapId, pageObjectId, requestId);

      if (!txResult.success) {
        throw new Error(txResult.error || 'Failed to reject request');
      }

      console.log('✅ Edit request rejected:', txResult.txHash);
      success('Edit request rejected successfully');

      if (currentAccount?.address) {
        await fetchUserPages(currentAccount.address);
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
      error('Failed to reject request: ' + (err as Error).message);
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
      } catch (err) {
        console.error('Error loading request content:', err);
        error('Failed to load content: ' + (err as Error).message);
        setViewingRequest({ page, request });
      } finally {
        setLoadingRequestContent(false);
      }
    } else {
      setViewingRequest({ page, request });
    }
  };

  if (!currentAccount) {
    return (
      <>
        <Sidebar />
        <main className="min-h-screen w-full bg-white flex items-center justify-center pt-16 lg:pt-0">
          <div className="text-center max-w-md px-6">
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
        </main>
      </>
    );
  }

  if (!authorCapId) {
    return (
      <>
        <Sidebar />
        <main className="min-h-screen w-full bg-white flex items-center justify-center pt-16 lg:pt-0">
          <div className="text-center max-w-md px-6">
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
          />

          <UserArticlesList
            pages={pages}
            onEdit={handleEdit}
            onDelete={(page) => setDeleteConfirmPage(page)}
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
          />

          {/* Toast Notifications */}
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => hideToast(toast.id)}
            />
          ))}
        </div>
      </main>
    </>
  );
}
