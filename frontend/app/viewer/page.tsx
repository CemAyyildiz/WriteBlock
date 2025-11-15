'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from '@/components/Navbar';
import { MOCK_PAGE } from '@/lib/mockData';

export default function ViewerPage() {
  const [pageData] = useState(MOCK_PAGE);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>📖</span>
            <span>Okuma Görünümü</span>
            <span className="mx-2">•</span>
            <span>Herkes içeriği görüntüleyebilir</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Sayfa İçeriği
          </h1>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          {/* Markdown Content */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {pageData.markdown_content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Versiyon
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      v{pageData.version}
                    </span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full font-medium">
                      Güncel
                    </span>
                  </div>
                </div>

                <div className="h-12 w-px bg-gray-300 dark:bg-gray-600" />

                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Yazar Adresi
                  </div>
                  <div className="font-mono text-sm text-gray-900 dark:text-white font-medium">
                    {formatAddress(pageData.author)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Son Güncelleme
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {formatDate(pageData.updated_at)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <span>🔗</span>
            <span>Blockchain Bilgileri</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Sayfa ID
              </div>
              <div className="font-mono text-sm text-gray-900 dark:text-white">
                #{pageData.page_id}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Walrus BLOB ID
              </div>
              <div className="font-mono text-xs text-gray-900 dark:text-white truncate">
                {pageData.walrus_blob_id}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Oluşturulma Tarihi
              </div>
              <div className="text-sm text-gray-900 dark:text-white">
                {formatDate(pageData.created_at)}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Tam Yazar Adresi
              </div>
              <div className="font-mono text-xs text-gray-900 dark:text-white truncate">
                {pageData.author}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                  Otantiklik Doğrulaması
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Bu sayfa Sui blockchain üzerinde saklanmaktadır. Versiyon numarası ve yazar
                  adresi, içeriğin özgünlüğünü ve değişmezliğini garanti eder. İçerik Walrus
                  dağıtık depolama sisteminde kalıcı olarak saklanır.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

