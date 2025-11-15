'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from '@/components/Navbar';
import { getPageBySlug } from '@/lib/mockData';
import { PageMetadata } from '@/types';

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [page, setPage] = useState<PageMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch page data by slug
    const pageData = getPageBySlug(slug);
    
    if (!pageData) {
      setLoading(false);
      return;
    }

    setPage(pageData);
    setLoading(false);
  }, [slug]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Yazı Bulunamadı
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Aradığınız yazı mevcut değil veya kaldırılmış olabilir.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
          >
            ← Dashboard'a Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <span>←</span>
          <span>Tüm Yazılar</span>
        </button>

        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {page.title}
          </h1>
          
          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span>👤</span>
              <span className="font-mono">{formatAddress(page.author)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>{formatDate(page.updated_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔢</span>
              <span>Versiyon {page.version}</span>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="p-8 md:p-12">
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {page.markdown_content || ''}
              </ReactMarkdown>
            </div>
          </div>
        </article>

        {/* Blockchain Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8">
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
                #{page.page_id}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Walrus BLOB ID
              </div>
              <div className="font-mono text-xs text-gray-900 dark:text-white truncate">
                {page.walrus_blob_id}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Oluşturulma Tarihi
              </div>
              <div className="text-sm text-gray-900 dark:text-white">
                {formatDate(page.created_at)}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Yazar Adresi
              </div>
              <div className="font-mono text-xs text-gray-900 dark:text-white truncate">
                {page.author}
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

        {/* Back to Dashboard */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
          >
            ← Tüm Yazılara Dön
          </button>
        </div>
      </div>
    </div>
  );
}

