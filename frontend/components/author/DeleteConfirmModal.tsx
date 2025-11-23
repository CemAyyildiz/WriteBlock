import { PageMetadata } from '@/types';

interface DeleteConfirmModalProps {
  page: PageMetadata | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  page,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!page) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🗑️</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            Delete Article?
          </h2>
          <p className="text-gray-600">
            This will mark the article as deleted. This action cannot be undone.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm font-semibold text-gray-900 mb-1">
            {page.title}
          </div>
          <div className="text-xs text-gray-500">
            Version: {page.version} • Slug: {page.slug}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Article</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

