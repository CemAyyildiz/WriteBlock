'use client';

import Link from 'next/link';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { getAllPages } from '@/lib/mockData';
import { PageMetadata } from '@/types';

export default function Dashboard() {
  const [pages] = useState<PageMetadata[]>(getAllPages());

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                📚 Tüm Yazılar
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                WriteBlock merkeziyetsiz CMS ile yayınlanan içerikler
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {pages.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Toplam Yazı
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⛓️</span>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Blockchain</div>
                <div className="font-semibold text-gray-900 dark:text-white">Sui Network</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🐋</span>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Storage</div>
                <div className="font-semibold text-gray-900 dark:text-white">Walrus</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✍️</span>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Aktif Yazarlar</div>
                <div className="font-semibold text-gray-900 dark:text-white">2 Yazar</div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {pages.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Henüz yazı yok
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                İlk yazıyı oluşturmak için yazar paneline gidin
              </p>
              <Link
                href="/author"
                className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
              >
                Yeni Yazı Oluştur
              </Link>
            </div>
          ) : (
            pages.map((page) => (
              <Link
                key={page.page_id}
                href={`/${page.slug}`}
                className="block group"
              >
                <article className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-700 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {page.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {page.excerpt}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900 dark:to-blue-900 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📄</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
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
                        <span>v{page.version}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium group-hover:gap-3 transition-all">
                      <span>Oku</span>
                      <span>→</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))
          )}
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">ℹ️</span>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Merkeziyetsiz İçerik Yönetimi
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                Bu sayfadaki tüm yazılar Sui blockchain üzerinde metadata olarak saklanır ve içerikleri 
                Walrus dağıtık depolama sisteminde kalıcı olarak tutulur.
              </p>
              <div className="flex gap-4 mt-4">
                <Link
                  href="/admin"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  👑 Admin Paneli
                </Link>
                <Link
                  href="/author"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  ✍️ Yazar Paneli
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
