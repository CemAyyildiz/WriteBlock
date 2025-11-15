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
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white dark:bg-navy-950">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="inline-block w-16 h-16 border-4 border-navy-600 border-t-neon-green rounded-full animate-spin"></div>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 font-medium">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-off-white dark:bg-navy-950">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="text-8xl mb-8 opacity-50">😕</div>
          <h1 className="text-4xl font-bold text-navy-800 dark:text-navy-200 mb-4">
            Article Not Found
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-md mx-auto">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/')}
            className="modern-button inline-flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white dark:bg-navy-950">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-8 inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-700 transition-all hover:gap-3"
        >
          <span>←</span>
          <span>All Articles</span>
        </button>

        {/* Article Header */}
        <header className="mb-12">
          <h1 className="text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-navy-800 to-navy-600 dark:from-navy-100 dark:to-navy-300 bg-clip-text text-transparent">
            {page.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="provenance-chip">
              <span className="text-navy-700 dark:text-navy-300">👤</span>
              <span>{formatAddress(page.author)}</span>
            </div>
            <div className="provenance-chip">
              <span className="text-navy-700 dark:text-navy-300">📅</span>
              <span>{formatDate(page.updated_at)}</span>
            </div>
            <div className="provenance-chip">
              <span className="text-navy-700 dark:text-navy-300">🔢</span>
              <span>Version {page.version}</span>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="glass-card mb-12 overflow-hidden">
          <div className="p-12 lg:p-16">
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {page.markdown_content || ''}
              </ReactMarkdown>
            </div>
          </div>
        </article>

        {/* Provenance Footer - Blockchain Info */}
        <div className="glass-card p-8 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 flex items-center justify-center border border-neon-green/30">
              <span className="text-2xl">🔗</span>
            </div>
            <h2 className="text-2xl font-bold text-navy-800 dark:text-navy-200">
              Blockchain Provenance
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-navy-50 to-navy-100 dark:from-navy-900 dark:to-navy-800">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Page ID
              </div>
              <div className="font-mono text-lg font-bold text-navy-700 dark:text-navy-300">
                #{page.page_id}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-navy-50 to-navy-100 dark:from-navy-900 dark:to-navy-800">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Walrus BLOB ID
              </div>
              <div className="font-mono text-sm text-navy-700 dark:text-navy-300 truncate">
                {page.walrus_blob_id}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-navy-50 to-navy-100 dark:from-navy-900 dark:to-navy-800">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Created On
              </div>
              <div className="text-sm font-medium text-navy-700 dark:text-navy-300">
                {formatDate(page.created_at)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-navy-50 to-navy-100 dark:from-navy-900 dark:to-navy-800">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Author Address
              </div>
              <div className="font-mono text-sm text-navy-700 dark:text-navy-300 truncate">
                {page.author}
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-r from-neon-green/10 to-neon-cyan/10 border border-neon-green/20">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
                <span className="text-xl">✓</span>
              </div>
              <div>
                <h3 className="font-bold text-navy-800 dark:text-navy-200 mb-2">
                  Authenticity Verified
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  This article is stored on the Sui blockchain. The version number and author address guarantee 
                  content authenticity and immutability. Content is permanently stored on Walrus distributed storage.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="modern-button inline-flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to All Articles</span>
          </button>
        </div>
      </div>
    </div>
  );
}
