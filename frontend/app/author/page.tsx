'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'easymde/dist/easymde.min.css';
import Navbar from '@/components/Navbar';
import { getStorageClient, getBlockchainClient, getWalletClient, initializeSuiWallet, getProviderConfig } from '@/lib/client';
import { PageMetadata } from '@/types';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });

export default function AuthorPage() {
  const router = useRouter();
  const [pages, setPages] = useState<PageMetadata[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  
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

      // Fetch user capabilities
      const fetchCapabilities = async () => {
        try {
          const wallet = getWalletClient();
          const caps = await wallet.getUserCapabilities(currentAccount.address);
          
          if (caps.authorCapId) {
            setAuthorCapId(caps.authorCapId);
          } else if (caps.adminCapId) {
            // Admin has Admin capability but needs Author capability to publish
            alert('⚠️ You have Admin capability but need Author capability to publish articles.\n\nPlease go to Admin Panel and grant yourself Author capability first!');
          }

          // Get registry ID from env
          const envRegistryId = process.env.NEXT_PUBLIC_REGISTRY_ID;
          if (envRegistryId) {
            setRegistryId(envRegistryId);
          }

          // Fetch user's pages
          await fetchUserPages(currentAccount.address);
        } catch (error) {
          console.error('Error fetching capabilities:', error);
        }
      };

      fetchCapabilities();
    }
  }, [currentAccount, signAndExecuteTransaction, config.wallet]);

  // Fetch pages authored by current user
  const fetchUserPages = async (userAddress: string) => {
    try {
      setLoadingPages(true);
      const blockchainClient = getBlockchainClient();
      const envRegistryId = process.env.NEXT_PUBLIC_REGISTRY_ID;

      if (!envRegistryId) {
        console.warn('Registry ID not configured');
        return;
      }

      // Get all page IDs from registry
      const pageIds = await blockchainClient.getAllPages(envRegistryId);
      
      // Fetch metadata and filter by author
      const userPages: PageMetadata[] = [];
      for (const pageId of pageIds) {
        try {
          const metadata = await blockchainClient.getPageMetadata(pageId);
          
          // Only include pages authored by current user and not deleted
          if (metadata.author.toLowerCase() === userAddress.toLowerCase() && !metadata.deleted) {
            // Try to fetch content from Walrus to get title, excerpt, slug
            let title = `Article #${metadata.pageId}`;
            let excerpt = 'Click to view content';
            let slug = `page-${metadata.pageId}`;
            
            try {
              const storageClient = getStorageClient();
              const blobContent = await storageClient.download(metadata.walrusBlobId);
              
              try {
                const blobData = JSON.parse(blobContent);
                title = blobData.title || title;
                excerpt = blobData.excerpt || excerpt;
                slug = blobData.slug || slug;
              } catch {
                // Old format - extract from markdown
                const titleMatch = blobContent.match(/^#\s+(.+)$/m);
                if (titleMatch) {
                  title = titleMatch[1];
                }
                const contentWithoutTitle = blobContent.replace(/^#\s+.+$/m, '').trim();
                const firstParagraph = contentWithoutTitle.split('\n\n')[0];
                excerpt = firstParagraph ? (firstParagraph.substring(0, 150) + (firstParagraph.length > 150 ? '...' : '')) : excerpt;
              }
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
            });
          }
        } catch (err) {
          console.warn(`Failed to fetch page ${pageId}:`, err);
        }
      }

      // Sort by updated_at (newest first)
      userPages.sort((a, b) => b.updated_at - a.updated_at);
      
      setPages(userPages);
    } catch (error) {
      console.error('Error fetching user pages:', error);
    } finally {
      setLoadingPages(false);
    }
  };

  const editorOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: 'Write your content in Markdown...',
      status: ['lines', 'words', 'cursor'] as any,
      autofocus: false,
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

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    const autoSlug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Check if auto-generated slug is a reserved route
    const reservedRoutes = ['author', 'admin', 'api', '_next', 'favicon.ico'];
    if (reservedRoutes.includes(autoSlug.toLowerCase())) {
      setSlugError(`Bu slug rezerve edilmiş bir route: "${autoSlug}". Lütfen title'ı değiştirin.`);
    } else {
      setSlugError(null);
    }
    
    setSlug(autoSlug);
  };

  // Check slug uniqueness when slug changes (with debounce)
  useEffect(() => {
    if (!slug.trim() || slug.match(/^page-\d+$/)) {
      setSlugError(null);
      return;
    }

    // Check if slug is a reserved route
    const reservedRoutes = ['author', 'admin', 'api', '_next', 'favicon.ico'];
    if (reservedRoutes.includes(slug.toLowerCase())) {
      setSlugError(`Bu slug rezerve edilmiş bir route: "${slug}". Lütfen farklı bir slug kullanın.`);
      setIsCheckingSlug(false);
      return;
    }

    const checkSlug = async () => {
      setIsCheckingSlug(true);
      setSlugError(null);

      try {
        const blockchainClient = getBlockchainClient();
        const storageClient = getStorageClient();
        const envRegistryId = process.env.NEXT_PUBLIC_REGISTRY_ID;

        if (!envRegistryId) {
          setIsCheckingSlug(false);
          return;
        }

        const pageIds = await blockchainClient.getAllPages(envRegistryId);

        for (const pageId of pageIds) {
          try {
            const metadata = await blockchainClient.getPageMetadata(pageId);
            
            // Skip deleted pages - deleted slugs can be reused
            if (metadata.deleted) {
              continue;
            }
            
            const blobContent = await storageClient.download(metadata.walrusBlobId);

            try {
              const blobData = JSON.parse(blobContent);
              if (blobData.slug === slug) {
                setSlugError(`Bu slug zaten kullanılıyor: "${slug}"`);
                setIsCheckingSlug(false);
                return;
              }
            } catch {
              continue;
            }
          } catch (err) {
            continue;
          }
        }

        setSlugError(null);
      } catch (error) {
        console.warn('Error checking slug:', error);
      } finally {
        setIsCheckingSlug(false);
      }
    };

    // Debounce: wait 500ms after user stops typing
    const timeoutId = setTimeout(checkSlug, 500);
    return () => clearTimeout(timeoutId);
  }, [slug]);

  const handlePublish = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!slug.trim()) {
      alert('Please enter a slug');
      return;
    }
    
    // Check if slug is a reserved route
    const reservedRoutes = ['author', 'admin', 'api', '_next', 'favicon.ico'];
    if (reservedRoutes.includes(slug.toLowerCase())) {
      alert(`⚠️ Bu slug rezerve edilmiş bir route: "${slug}". Lütfen farklı bir slug kullanın.`);
      return;
    }
    
    if (!content.trim()) {
      alert('Please write some content');
      return;
    }

    // Check for Sui mode requirements
    if (config.blockchain === 'sui') {
      if (!currentAccount) {
        alert('Please connect your Sui wallet first');
        return;
      }
      if (!authorCapId) {
        alert('You need Author or Admin capability to publish. Check the Admin panel to grant capabilities.');
        return;
      }
      if (!registryId) {
        alert('Registry ID not configured. Please set NEXT_PUBLIC_REGISTRY_ID in .env.local');
        return;
      }
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setTxInfo(null);

    try {
      // Check if slug already exists
      const blockchainClient = getBlockchainClient();
      const storageClient = getStorageClient();
      const envRegistryId = process.env.NEXT_PUBLIC_REGISTRY_ID;
      
      if (envRegistryId) {
        console.log('🔍 Checking if slug already exists:', slug);
        const pageIds = await blockchainClient.getAllPages(envRegistryId);
        
        for (const pageId of pageIds) {
          try {
            const metadata = await blockchainClient.getPageMetadata(pageId);
            
            // Skip deleted pages - deleted slugs can be reused
            if (metadata.deleted) {
              continue;
            }
            
            const blobContent = await storageClient.download(metadata.walrusBlobId);
            
            // Try to parse as JSON (new format)
            try {
              const blobData = JSON.parse(blobContent);
              if (blobData.slug === slug) {
                alert(`⚠️ Bu slug zaten kullanılıyor: "${slug}"\n\nLütfen farklı bir slug kullanın veya mevcut slug'ı düzenleyin.`);
                setIsSaving(false);
                return;
              }
            } catch {
              // Old format - skip
              continue;
            }
          } catch (err) {
            console.warn(`Failed to check page ${pageId} for slug:`, err);
            continue;
          }
        }
        console.log('✅ Slug is unique:', slug);
      }
      
      // Create JSON blob with metadata (slug, title, excerpt) + markdown content
      const blobData = {
        slug: slug,
        title: title,
        excerpt: excerpt || '',
        content: content,
      };
      
      // Upload as JSON string
      const newWalrusBlobId = await storageClient.upload(JSON.stringify(blobData));
      console.log('✅ Content uploaded with metadata:', newWalrusBlobId);
      
      // Use real IDs for Sui, mock IDs for mock mode
      const capabilityId = config.blockchain === 'sui' ? authorCapId! : 'mock_author_cap_id';
      const registry = config.blockchain === 'sui' ? registryId! : 'mock_registry_id';
      
      // Create new page instead of updating
      const txResult = await blockchainClient.createPage(
        capabilityId,
        registry,
        newWalrusBlobId
      );
      
      console.log('✅ Page published:', txResult.txHash);
      
      if (!txResult.success) {
        throw new Error(txResult.error || 'Transaction failed');
      }
      
      setTxInfo({
        walrusBlobId: newWalrusBlobId,
        txHash: txResult.txHash,
      });
      setSaveSuccess(true);
      
      // Clear form
      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent('');
      
      // Refresh user's pages after successful publish
      if (config.wallet === 'sui' && currentAccount) {
        await fetchUserPages(currentAccount.address);
      }
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Publish error:', error);
      alert('Publishing failed: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (page: PageMetadata) => {
    try {
      // Fetch content from Walrus
      const storageClient = getStorageClient();
      const blobContent = await storageClient.download(page.walrus_blob_id);
      
      let blobData: any;
      try {
        blobData = JSON.parse(blobContent);
        setTitle(blobData.title || '');
        setSlug(blobData.slug || `page-${page.page_id}`);
        setExcerpt(blobData.excerpt || '');
        setContent(blobData.content || '');
      } catch {
        // Old format - just markdown
        setTitle(page.title || '');
        setSlug(page.slug || `page-${page.page_id}`);
        setExcerpt(page.excerpt || '');
        setContent(blobContent);
      }
      
      setEditingPage(page);
      setSaveSuccess(false);
      setTxInfo(null);
      
      // Scroll to editor
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error loading page for edit:', error);
      alert('Failed to load page content: ' + (error as Error).message);
    }
  };

  const handleUpdate = async () => {
    if (!editingPage) return;
    
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!slug.trim()) {
      alert('Please enter a slug');
      return;
    }
    
    // Check if slug is a reserved route
    const reservedRoutes = ['author', 'admin', 'api', '_next', 'favicon.ico'];
    if (reservedRoutes.includes(slug.toLowerCase())) {
      alert(`⚠️ Bu slug rezerve edilmiş bir route: "${slug}". Lütfen farklı bir slug kullanın.`);
      return;
    }
    
    if (!content.trim()) {
      alert('Please write some content');
      return;
    }

    if (config.blockchain === 'sui') {
      if (!currentAccount) {
        alert('Please connect your Sui wallet first');
        return;
      }
      if (!authorCapId) {
        alert('You need Author capability to update pages.');
        return;
      }
    }

    setIsUpdating(true);
    setSaveSuccess(false);
    setTxInfo(null);

    try {
      const blockchainClient = getBlockchainClient();
      const storageClient = getStorageClient();
      
      // Check if slug changed and is unique (excluding current page)
      if (slug !== editingPage.slug) {
        const envRegistryId = process.env.NEXT_PUBLIC_REGISTRY_ID;
        if (envRegistryId) {
          const pageIds = await blockchainClient.getAllPages(envRegistryId);
          
          for (const pageId of pageIds) {
            try {
              const metadata = await blockchainClient.getPageMetadata(pageId);
              if (metadata.pageId === editingPage.page_id) continue; // Skip current page
              
              // Skip deleted pages - deleted slugs can be reused
              if (metadata.deleted) {
                continue;
              }
              
              const blobContent = await storageClient.download(metadata.walrusBlobId);
              try {
                const blobData = JSON.parse(blobContent);
                if (blobData.slug === slug) {
                  alert(`⚠️ Bu slug zaten kullanılıyor: "${slug}"`);
                  setIsUpdating(false);
                  return;
                }
              } catch {
                continue;
              }
            } catch (err) {
              continue;
            }
          }
        }
      }
      
      // Create JSON blob with updated content
      const blobData = {
        slug: slug,
        title: title,
        excerpt: excerpt || '',
        content: content,
      };
      
      // Upload updated content
      const newWalrusBlobId = await storageClient.upload(JSON.stringify(blobData));
      console.log('✅ Updated content uploaded:', newWalrusBlobId);
      
      // Update on blockchain
      const capabilityId = config.blockchain === 'sui' ? authorCapId! : 'mock_author_cap_id';
      
      if (!capabilityId) {
        throw new Error('Author capability not found');
      }

      // Get page object ID from registry
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

      const txResult = await blockchainClient.updatePageContent(
        capabilityId,
        pageObjectId,
        newWalrusBlobId
      );
      
      if (!txResult.success) {
        throw new Error(txResult.error || 'Update transaction failed');
      }
      
      console.log('✅ Page updated:', txResult.txHash);
      
      setTxInfo({
        walrusBlobId: newWalrusBlobId,
        txHash: txResult.txHash,
      });
      setSaveSuccess(true);
      
      // Clear form and editing state
      setTitle('');
      setSlug('');
      setExcerpt('');
      setContent('');
      setEditingPage(null);
      
      // Refresh user's pages
      if (config.wallet === 'sui' && currentAccount) {
        await fetchUserPages(currentAccount.address);
      }
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Update error:', error);
      alert('Update failed: ' + (error as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmPage) return;
    
    if (config.blockchain === 'sui') {
      if (!currentAccount) {
        alert('Please connect your Sui wallet first');
        return;
      }
      if (!authorCapId) {
        alert('You need Author capability to delete pages.');
        return;
      }
    }

    setIsDeleting(true);

    try {
      const blockchainClient = getBlockchainClient();
      const capabilityId = config.blockchain === 'sui' ? authorCapId! : 'mock_author_cap_id';
      
      if (!capabilityId) {
        throw new Error('Author capability not found');
      }

      // Get page object ID from registry
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

      const txResult = await blockchainClient.deletePage(
        capabilityId,
        pageObjectId
      );
      
      if (!txResult.success) {
        throw new Error(txResult.error || 'Delete transaction failed');
      }
      
      console.log('✅ Page deleted:', txResult.txHash);
      
      // Close confirmation dialog
      setDeleteConfirmPage(null);
      
      // Refresh user's pages
      if (config.wallet === 'sui' && currentAccount) {
        await fetchUserPages(currentAccount.address);
      }
      
      alert('✅ Page deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed: ' + (error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-off-white dark:bg-navy-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-neon-green/20 to-neon-cyan/20 border border-neon-green/30">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
            <span className="text-sm font-semibold text-navy-700 dark:text-navy-300">Authorized Writer</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-navy-800 to-navy-600 dark:from-navy-200 dark:to-navy-400 bg-clip-text text-transparent">
            Content Editor
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            Create and publish decentralized articles
          </p>
        </div>

        {/* My Articles Section */}
        {pages.length > 0 && (
          <div className="mb-8 glass-card p-6">
            <h2 className="text-2xl font-bold text-navy-800 dark:text-navy-200 mb-4">
              My Articles ({pages.length})
            </h2>
            <div className="space-y-3">
              {pages.map((page) => (
                <div
                  key={page.page_id}
                  className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-gray-200 dark:border-gray-700 hover:border-neon-green/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-navy-800 dark:text-navy-200 mb-1">
                        {page.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {page.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <span>Slug: {page.slug}</span>
                        <span>•</span>
                        <span>Updated: {formatDate(page.updated_at)}</span>
                        <span>•</span>
                        <span>Version: {page.version}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(page)}
                        className="px-3 py-1.5 text-sm font-medium text-navy-700 dark:text-navy-300 bg-navy-100 dark:bg-navy-800 hover:bg-navy-200 dark:hover:bg-navy-700 rounded-lg transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmPage(page)}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Card */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-navy-500 to-navy-700">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Connected Address
                    </div>
                    <div className="font-mono text-sm font-semibold text-navy-700 dark:text-navy-300">
                      {config.wallet === 'sui' && currentAccount
                        ? `${currentAccount.address.substring(0, 10)}...${currentAccount.address.substring(currentAccount.address.length - 8)}`
                        : 'Not connected'
                      }
                    </div>
                  </div>
                </div>
                <div className="neon-badge">
                  {authorCapId ? '✓ Authorized' : '⚠️ No Capability'}
                </div>
              </div>
            </div>

            {/* Meta Fields */}
            <div className="glass-card p-8">
              <h2 className="text-xl font-bold text-navy-800 dark:text-navy-200 mb-6">
                Article Information
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-navy-700 dark:text-navy-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g., Getting Started with WriteBlock"
                    className="modern-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 dark:text-navy-300 mb-2">
                    URL Slug *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setSlugError(null);
                      }}
                      placeholder="getting-started-writeblock"
                      className={`modern-input font-mono ${slugError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {isCheckingSlug && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-navy-300 border-t-neon-green rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {slugError ? (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-2 font-medium">
                      ⚠️ {slugError}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-mono">
                      URL: yoursite.com/{slug || 'slug'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 dark:text-navy-300 mb-2">
                    Excerpt (Optional)
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief description of your article..."
                    rows={2}
                    className="modern-input resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Editor */}
            <div className="glass-card overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700 p-6 bg-gradient-to-r from-navy-50 to-navy-100 dark:from-navy-900 dark:to-navy-800">
                <h2 className="text-xl font-bold text-navy-800 dark:text-navy-200">
                  Content Editor
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Write in Markdown format
                </p>
              </div>

              <div className="p-6">
                <SimpleMDE
                  value={content}
                  onChange={setContent}
                  options={editorOptions}
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gradient-to-r from-navy-50 to-navy-100 dark:from-navy-900 dark:to-navy-800">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    <span className="font-bold text-navy-700 dark:text-navy-300">{content.length}</span> characters
                  </div>
                  <div className="flex items-center gap-3">
                    {editingPage && (
                      <button
                        onClick={() => {
                          setEditingPage(null);
                          setTitle('');
                          setSlug('');
                          setExcerpt('');
                          setContent('');
                          setSaveSuccess(false);
                          setTxInfo(null);
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-800 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={editingPage ? handleUpdate : handlePublish}
                      disabled={(isSaving || isUpdating) || !title || !slug || !content || !!slugError || isCheckingSlug}
                      className="modern-button inline-flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {(isSaving || isUpdating) ? (
                        <>
                          <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{editingPage ? 'Updating...' : 'Publishing...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{editingPage ? '💾' : '🚀'}</span>
                          <span>{editingPage ? 'Update Article' : 'Publish Article'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {saveSuccess && txInfo && (
              <div className="glass-card p-8 border-2 border-neon-green/30 bg-gradient-to-r from-neon-green/5 to-neon-cyan/5">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center shadow-lg">
                    <span className="text-3xl">✅</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-navy-800 dark:text-navy-200 mb-3">
                      Article Published Successfully!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Your content has been uploaded to Walrus and recorded on Sui blockchain.
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="p-4 rounded-xl bg-white dark:bg-navy-900">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                          Walrus BLOB ID
                        </div>
                        <div className="font-mono text-sm text-navy-700 dark:text-navy-300 break-all">
                          {txInfo.walrusBlobId}
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-white dark:bg-navy-900">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                          Sui Transaction Hash
                        </div>
                        <div className="font-mono text-sm text-navy-700 dark:text-navy-300 break-all">
                          {txInfo.txHash}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (slug) {
                          router.push(`/${slug}`);
                        } else {
                          router.push('/');
                        }
                      }}
                      className="modern-button w-full"
                    >
                      View Published Article →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Articles */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-navy-800 dark:text-navy-200 mb-5 flex items-center gap-2">
                <span>📝</span>
                <span>My Articles</span>
              </h3>
              
              {loadingPages ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-3 border-navy-300 border-t-neon-green rounded-full animate-spin"></div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Loading...</p>
                </div>
              ) : pages.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No articles yet. Publish your first article!
                </p>
              ) : (
                <div className="space-y-3">
                  {pages.slice(0, 5).map((page) => (
                    <button
                      key={page.page_id}
                      onClick={() => router.push(`/${page.slug}`)}
                      className="w-full text-left p-4 rounded-xl hover:bg-navy-50 dark:hover:bg-navy-900 transition-all group border border-transparent hover:border-navy-200 dark:hover:border-navy-700"
                    >
                      <div className="font-semibold text-sm text-navy-700 dark:text-navy-300 truncate group-hover:text-navy-600 dark:group-hover:text-neon-green transition-colors">
                        {page.title}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <span>{formatDate(page.updated_at)}</span>
                        <span>•</span>
                        <span className="provenance-chip !text-xs !px-2 !py-1">v{page.version}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-navy-800 dark:text-navy-200 mb-5 flex items-center gap-2">
                <span>💡</span>
                <span>How It Works</span>
              </h3>
              
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-3 font-semibold text-navy-700 dark:text-navy-300 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center text-white text-sm">
                      1
                    </div>
                    <span>Walrus Upload</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-11 leading-relaxed">
                    Content is uploaded as BLOB to Walrus storage
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-3 font-semibold text-navy-700 dark:text-navy-300 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center text-white text-sm">
                      2
                    </div>
                    <span>Blockchain Record</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-11 leading-relaxed">
                    BLOB ID is recorded on Sui blockchain
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-3 font-semibold text-navy-700 dark:text-navy-300 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center text-white text-sm">
                      3
                    </div>
                    <span>Go Live</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-11 leading-relaxed">
                    Your article becomes publicly accessible
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmPage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 max-w-md w-full border-2 border-red-200 dark:border-red-900">
            <h3 className="text-2xl font-bold text-navy-800 dark:text-navy-200 mb-4">
              Delete Article?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <strong>"{deleteConfirmPage.title}"</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmPage(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-navy-800 hover:bg-gray-200 dark:hover:bg-navy-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <span>🗑️</span>
                    <span>Delete</span>
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
