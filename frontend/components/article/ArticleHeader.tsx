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
    <header>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 text-gray-600 hover:text-gray-900 transition-colors duration-200 inline-flex items-center gap-2 text-sm"
      >
        <span>←</span>
        <span>Back to articles</span>
      </button>

      {/* Article Title - Academic style */}
      <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">
        {title}
      </h1>
      
      {/* Author and metadata */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <span className="font-medium">Author:</span>
          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{formatAddress(author)}</span>
        </div>
        <span className="text-gray-300">|</span>
        <time dateTime={new Date(updatedAt).toISOString()} className="text-gray-600">
          {formatDate(updatedAt)}
        </time>
        <span className="text-gray-300">|</span>
        <span className="text-gray-500 font-mono text-xs">Version {version}</span>
      </div>
    </header>
  );
}

