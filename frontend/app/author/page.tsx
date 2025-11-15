'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'easymde/dist/easymde.min.css';
import Navbar from '@/components/Navbar';
import { MOCK_ADDRESSES, getAllPages } from '@/lib/mockData';
import { getStorageClient, getBlockchainClient } from '@/lib/client';
import { PageMetadata } from '@/types';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });

export default function AuthorPage() {
  const router = useRouter();
  const [pages] = useState<PageMetadata[]>(getAllPages());
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [txInfo, setTxInfo] = useState<{ walrusBlobId: string; txHash: string } | null>(null);

  const editorOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: 'Write your content in Markdown...',
      status: ['lines', 'words', 'cursor'],
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
      ],
    };
  }, []);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    const autoSlug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(autoSlug);
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!slug.trim()) {
      alert('Please enter a slug');
      return;
    }
    if (!content.trim()) {
      alert('Please write some content');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setTxInfo(null);

    try {
      const storageClient = getStorageClient();
      const newWalrusBlobId = await storageClient.upload(content);
      console.log('✅ Content uploaded:', newWalrusBlobId);
      
      const blockchainClient = getBlockchainClient();
      const txResult = await blockchainClient.updatePageContent(
        'mock_author_cap_id',
        'mock_page_id',
        newWalrusBlobId
      );
      console.log('✅ Page published:', txResult.txHash);
      
      setTxInfo({
        walrusBlobId: newWalrusBlobId,
        txHash: txResult.txHash,
      });
      setSaveSuccess(true);
      
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
                      {MOCK_ADDRESSES.author1.substring(0, 10)}...{MOCK_ADDRESSES.author1.substring(MOCK_ADDRESSES.author1.length - 8)}
                    </div>
                  </div>
                </div>
                <div className="neon-badge">
                  ✓ Authorized
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
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="getting-started-writeblock"
                    className="modern-input font-mono"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-mono">
                    URL: yoursite.com/{slug || 'slug'}
                  </p>
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
                  <button
                    onClick={handlePublish}
                    disabled={isSaving || !title || !slug || !content}
                    className="modern-button inline-flex items-center gap-3"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>Publish Article</span>
                      </>
                    )}
                  </button>
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
                      onClick={() => router.push(`/${slug}`)}
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
              
              {pages.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No articles yet
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
    </div>
  );
}
