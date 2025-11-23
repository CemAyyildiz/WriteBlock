import Link from 'next/link';
import { Clock, BookOpen } from 'lucide-react';
import { PageMetadata } from '@/types';

interface ArticleListItemProps {
  article: PageMetadata;
}

export default function ArticleListItem({ article }: ArticleListItemProps) {
  return (
    <article className="group border-b border-gray-200 pb-12 last:border-0">
      <Link href={`/${article.slug}`}>
        <div className="flex gap-8 items-start">
          {/* Left: Meta Info */}
          <div className="flex-shrink-0 w-32 pt-1">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Story
            </div>
            <time className="text-sm text-gray-600" dateTime={new Date(article.updated_at).toISOString()}>
              {new Date(article.updated_at).toLocaleDateString('en-US', { 
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </time>
          </div>

          {/* Center: Content */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-3 leading-tight group-hover:text-gray-700 transition-colors">
              {article.title}
            </h2>

            <p className="text-base text-gray-600 leading-relaxed mb-4 line-clamp-2">
              {article.excerpt}
            </p>

            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{Math.ceil((article.excerpt?.length || 0) / 200) || 1} min read</span>
              </div>
              <span>•</span>
              <span className="text-gray-400">v{article.version}</span>
            </div>
          </div>

          {/* Right: Icon/Badge */}
          <div className="hidden sm:flex flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 items-center justify-center">
            <BookOpen className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </Link>
    </article>
  );
}

