'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'easymde/dist/easymde.min.css';
import Navbar from '@/components/Navbar';
import { MOCK_ADDRESSES, getAllPages } from '@/lib/mockData';
import { getStorageClient, getBlockchainClient } from '@/lib/client';
import { PageMetadata } from '@/types';

// Dynamically import SimpleMDE to avoid SSR issues
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });

export default function AuthorPage() {
  const router = useRouter();
  const [pages] = useState<PageMetadata[]>(getAllPages());
  
  // Editor state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [txInfo, setTxInfo] = useState<{ walrusBlobId: string; txHash: string } | null>(null);

  const editorOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: 'Markdown içeriğinizi buraya yazın...',
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

  // Generate slug from title
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // Auto-generate slug
    const autoSlug = newTitle
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(autoSlug);
  };

  const handlePublish = async () => {
    // Validation
    if (!title.trim()) {
      alert('Lütfen bir başlık girin');
      return;
    }
    if (!slug.trim()) {
      alert('Lütfen bir slug girin');
      return;
    }
    if (!content.trim()) {
      alert('Lütfen içerik yazın');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setTxInfo(null);

    try {
      // Step 1: Upload content to storage (Walrus or Mock)
      const storageClient = getStorageClient();
      const newWalrusBlobId = await storageClient.upload(content);
      console.log('✅ Content uploaded:', newWalrusBlobId);
      
      // Step 2: Create/Update page on blockchain (Sui or Mock)
      const blockchainClient = getBlockchainClient();
      const txResult = await blockchainClient.updatePageContent(
        'mock_author_cap_id', // In real app, get from wallet
        'mock_page_id',       // In real app, create new or update existing
        newWalrusBlobId
      );
      console.log('✅ Page published:', txResult.txHash);
      
      // Step 3: Show success
      setTxInfo({
        walrusBlobId: newWalrusBlobId,
        txHash: txResult.txHash,
      });
      setSaveSuccess(true);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSaveSuccess(false);
        // Optionally redirect to the new page
        // router.push(`/${slug}`);
      }, 5000);
    } catch (error) {
      console.error('Publish error:', error);
      alert('Yayınlama başarısız: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>✍️</span>
            <span>Yazar Paneli</span>
            <span className="mx-2">•</span>
            <span>Yetkili Yazarlar İçin</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            İçerik Yönetimi
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Giriş Yapan Adres
                    </div>
                    <div className="font-mono text-sm text-gray-900 dark:text-white font-medium">
                      {MOCK_ADDRESSES.author1.substring(0, 10)}...{MOCK_ADDRESSES.author1.substring(MOCK_ADDRESSES.author1.length - 8)}
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                  ✓ Yetkilendirildi
                </div>
              </div>
            </div>

            {/* Meta Fields */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Yazı Bilgileri
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Örn: WriteBlock'a Başlangıç"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="writeblock-a-baslangic"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm dark:bg-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    URL: siteminadı.com/{slug || 'slug'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Özet (Opsiyonel)
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Kısa bir özet yazın..."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  İçerik Editörü
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Markdown formatında içerik yazın
                </p>
              </div>

              <div className="p-4">
                <SimpleMDE
                  value={content}
                  onChange={setContent}
                  options={editorOptions}
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{content.length}</span> karakter
                  </div>
                  <button
                    onClick={handlePublish}
                    disabled={isSaving || !title || !slug || !content}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-md"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Yayınlanıyor...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>Yayınla</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {saveSuccess && txInfo && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-900 dark:text-green-300 mb-2">
                      Yazı Başarıyla Yayınlandı!
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-400 mb-4">
                      İçeriğiniz Walrus'a yüklendi ve Sui blockchain'e kaydedildi.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Walrus BLOB ID
                        </div>
                        <div className="font-mono text-sm text-gray-900 dark:text-white break-all">
                          {txInfo.walrusBlobId}
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Sui Transaction Hash
                        </div>
                        <div className="font-mono text-sm text-gray-900 dark:text-white break-all">
                          {txInfo.txHash}
                        </div>
                      </div>

                      <button
                        onClick={() => router.push(`/${slug}`)}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Yazıyı Görüntüle →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Posts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📝 Yazılarım
              </h3>
              
              {pages.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Henüz yazı yok
                </p>
              ) : (
                <div className="space-y-3">
                  {pages.slice(0, 5).map((page) => (
                    <button
                      key={page.page_id}
                      onClick={() => router.push(`/${page.slug}`)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {page.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(page.updated_at)} • v{page.version}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                💡 Nasıl Çalışır?
              </h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white mb-1">
                    <span>1️⃣</span>
                    <span>Walrus Upload</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 ml-6">
                    İçerik Walrus'a BLOB olarak yüklenir
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white mb-1">
                    <span>2️⃣</span>
                    <span>Blockchain Kayıt</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 ml-6">
                    BLOB ID Sui blockchain'e kaydedilir
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white mb-1">
                    <span>3️⃣</span>
                    <span>Yayınla</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 ml-6">
                    Yazınız herkese açık hale gelir
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
