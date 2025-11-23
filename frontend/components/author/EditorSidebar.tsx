import Link from 'next/link';
import { PageMetadata } from '@/types';

interface EditorSidebarProps {
  pages: PageMetadata[];
  onEdit: (page: PageMetadata) => void;
}

export default function EditorSidebar({ pages, onEdit }: EditorSidebarProps) {
  return (
    <div className="lg:col-span-1 space-y-6">
      {/* My Articles Mini List */}
      {pages.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Access</h3>
          <div className="space-y-2">
            {pages.slice(0, 5).map((page) => (
              <button
                key={page.page_id}
                onClick={() => onEdit(page)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <div className="font-medium text-sm text-gray-900 line-clamp-1 mb-1">
                  {page.title}
                </div>
                <div className="text-xs text-gray-500">
                  v{page.version} • {page.slug}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">How It Works</h3>
        <ol className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
              1
            </span>
            <div>
              <div className="font-semibold text-gray-900">Write</div>
              <div className="text-gray-600">Create your article using Markdown</div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
              2
            </span>
            <div>
              <div className="font-semibold text-gray-900">Store</div>
              <div className="text-gray-600">Content uploaded to Walrus storage</div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
              3
            </span>
            <div>
              <div className="font-semibold text-gray-900">Publish</div>
              <div className="text-gray-600">Metadata recorded on Sui blockchain</div>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
              4
            </span>
            <div>
              <div className="font-semibold text-gray-900">Forever</div>
              <div className="text-gray-600">Your content lives permanently</div>
            </div>
          </li>
        </ol>

        <Link
          href="/"
          className="mt-6 w-full px-4 py-2 bg-gray-900 text-white text-center rounded-lg font-medium hover:bg-gray-800 transition-colors block"
        >
          View Published Articles
        </Link>
      </div>
    </div>
  );
}

