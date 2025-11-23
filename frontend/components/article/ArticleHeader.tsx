import { formatAddress, formatDate } from '@/lib/utils/format';

interface ArticleHeaderProps {
  title: string;
  author: string;
  updatedAt: number;
  version: number;
  onBack: () => void;
}

export default function ArticleHeader({ title, author, updatedAt, version, onBack }: ArticleHeaderProps) {

  return (
    <>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-12 text-gray-600 hover:text-gray-900 transition-colors duration-200 inline-flex items-center gap-2"
      >
        <span>←</span>
        <span className="text-sm">Back</span>
      </button>

      {/* Article Header */}
      <header className="mb-12">
        <h1 className="text-5xl sm:text-6xl font-serif font-bold text-gray-900 mb-8 leading-tight">
          {title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 border-t border-b border-gray-200 py-4">
          <div className="flex items-center gap-2">
            <span>By</span>
            <span className="font-mono text-xs">{formatAddress(author)}</span>
          </div>
          <span>•</span>
          <time dateTime={new Date(updatedAt).toISOString()}>
            {formatDate(updatedAt)}
          </time>
          <span>•</span>
          <span className="text-gray-400">v{version}</span>
        </div>
      </header>
    </>
  );
}

