import { PageMetadata } from '@/types';
import { formatDate } from '@/lib/utils/format';

interface UserArticlesListProps {
  pages: PageMetadata[];
  onEdit: (page: PageMetadata) => void;
  onDelete: (page: PageMetadata) => void;
}

export default function UserArticlesList({
  pages,
  onEdit,
  onDelete,
}: UserArticlesListProps) {
  if (pages.length === 0) return null;

  return (
    <div className="mb-8 bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
        My Articles ({pages.length})
      </h2>
      <div className="space-y-3">
        {pages.map((page) => (
          <div
            key={page.page_id}
            className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {page.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {page.excerpt}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Slug: {page.slug}</span>
                  <span>•</span>
                  <span>Updated: {formatDate(page.updated_at)}</span>
                  <span>•</span>
                  <span>Version: {page.version}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onEdit(page)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => onDelete(page)}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

