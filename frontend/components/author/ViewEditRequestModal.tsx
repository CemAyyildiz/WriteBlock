import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PageMetadata } from '@/types';

interface ViewEditRequestModalProps {
  viewingRequest: { page: PageMetadata; request: any } | null;
  onClose: () => void;
  formatAddress: (address: string) => string;
  formatDate: (timestamp: number) => string;
}

export default function ViewEditRequestModal({
  viewingRequest,
  onClose,
  formatAddress,
  formatDate,
}: ViewEditRequestModalProps) {
  if (!viewingRequest) return null;

  const { page, request } = viewingRequest;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
              Edit Request Preview
            </h2>
            <p className="text-sm text-gray-600">
              For article: <span className="font-semibold">{page.title}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Request Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500 mb-1">Request ID</div>
              <div className="font-mono font-semibold text-gray-900">#{request.requestId}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Requester</div>
              <div className="font-mono font-semibold text-gray-900">{formatAddress(request.requester)}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Created At</div>
              <div className="font-semibold text-gray-900">{formatDate(request.createdAt)}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Status</div>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                {request.status}
              </span>
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Proposed Changes</h3>
          
          {request.content ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6 max-h-[500px] overflow-y-auto">
              <article className="prose prose-sm max-w-none markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {request.content}
                </ReactMarkdown>
              </article>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">
                Content not loaded. Please click "View Content" button to load.
              </p>
              <div className="mt-4 text-xs text-gray-400">
                Walrus Blob ID: <span className="font-mono">{request.newWalrusBlobId}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

