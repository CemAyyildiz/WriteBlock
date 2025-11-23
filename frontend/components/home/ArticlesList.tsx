import Link from 'next/link';
import { PageMetadata } from '@/types';

interface ArticlesListProps {
  pages: PageMetadata[];
}

export default function ArticlesList({ pages }: ArticlesListProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (pages.length === 0) {
    return (
      <div className="glass-card p-16 text-center">
        <div className="text-7xl mb-6 opacity-50">📝</div>
        <h3 className="text-2xl font-bold text-navy-700 dark:text-navy-300 mb-3">
          No articles yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Start creating content with the decentralized CMS
        </p>
        <Link
          href="/author"
          className="modern-button inline-flex items-center gap-2"
        >
          <span>Create First Article</span>
          <span>→</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pages.map((page) => (
        <Link
          key={page.page_id}
          href={`/${page.slug}`}
          className="block group"
        >
          <article className="glass-card p-8 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-navy-500/5 to-neon-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-6">
                  <h2 className="text-3xl font-bold mb-3 text-navy-800 dark:text-navy-100 group-hover:text-navy-600 dark:group-hover:text-neon-green transition-colors">
                    {page.title}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                    {page.excerpt}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-navy-100 to-navy-200 dark:from-navy-800 dark:to-navy-700 group-hover:shadow-xl transition-shadow">
                    <span className="text-3xl">📄</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-navy-600 dark:text-navy-400">👤</span>
                    <span>{formatAddress(page.author)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-navy-600 dark:text-navy-400">📅</span>
                    <span>{formatDate(page.updated_at)}</span>
                  </div>
                  <div className="provenance-chip">
                    v{page.version}
                  </div>
                </div>

                <div className="flex items-center gap-2 font-semibold text-navy-600 dark:text-neon-green group-hover:gap-4 transition-all">
                  <span>Read More</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}

