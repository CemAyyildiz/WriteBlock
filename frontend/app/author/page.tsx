'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'easymde/dist/easymde.min.css';
import Navbar from '@/components/Navbar';
import { MOCK_PAGE, MOCK_ADDRESSES } from '@/lib/mockData';
import { getStorageClient, getBlockchainClient } from '@/lib/client';

// Dynamically import SimpleMDE to avoid SSR issues
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });

export default function AuthorPage() {
  const [content, setContent] = useState(MOCK_PAGE.markdown_content);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [txInfo, setTxInfo] = useState<{ walrusBlobId: string; txHash: string } | null>(null);

  const editorOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: 'Markdown içeriğinizi buraya yazın...',
      status: ['lines', 'words', 'cursor'],
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
      ],
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setTxInfo(null);

    try {
      // Step 1: Upload content to storage (Walrus or Mock)
      const storageClient = getStorageClient();
      const newWalrusBlobId = await storageClient.upload(content);
      console.log('✅ Content uploaded:', newWalrusBlobId);
      
      // Step 2: Update page metadata on blockchain (Sui or Mock)
      const blockchainClient = getBlockchainClient();
      const txResult = await blockchainClient.updatePageContent(
        'mock_author_cap_id', // In real app, get from wallet
        'mock_page_id',       // In real app, get from page context
        newWalrusBlobId
      );
      console.log('✅ Blockchain updated:', txResult.txHash);
      
      // Step 3: Show success
      setTxInfo({
        walrusBlobId: newWalrusBlobId,
        txHash: txResult.txHash,
      });
      setSaveSuccess(true);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (error) {
      console.error('Save error:', error);
      alert('Kaydetme başarısız: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>✍️</span>
            <span>Yazma Görünümü</span>
            <span className="mx-2">•</span>
            <span>Yetkili Yazarlar İçin</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Markdown Editörü
            </h1>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                ✓ Yetkilendirildi
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 mb-6">
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
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Rol
              </div>
              <div className="font-semibold text-primary-600 dark:text-primary-400">
                Author
              </div>
            </div>
          </div>
        </div>

        {/* Editor Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              İçerik Düzenle
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Markdown formatında içerik oluşturun veya düzenleyin
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
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-md"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>Kaydet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {saveSuccess && txInfo && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-900 dark:text-green-300 mb-2">
                  İçerik Başarıyla Kaydedildi!
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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <span>🔄</span>
            <span>Kaydetme İşlemi Nasıl Çalışır?</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="text-2xl mb-2">1️⃣</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Walrus'a Yükle
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                İçerik önce Walrus dağıtık depolama sistemine BLOB olarak yüklenir ve benzersiz bir ID alır.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="text-2xl mb-2">2️⃣</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Blockchain'e Kaydet
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Walrus BLOB ID, Sui blockchain üzerindeki Page_Metadata objesinde güncellenir.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="text-2xl mb-2">3️⃣</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Versiyon Artır
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sayfa versiyonu otomatik olarak artırılır ve güncelleme zamanı kaydedilir.
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>Not:</strong> Bu demo sürümünde gerçek Walrus yüklemesi ve Sui işlemleri simüle edilmiştir. Üretim ortamında gerçek işlemler gerçekleştirilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

