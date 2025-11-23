import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PageMetadata } from '@/types';
import { formatAddress, formatDate } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { X, FileEdit, User, Calendar, AlertCircle } from 'lucide-react';

interface ViewEditRequestModalProps {
  viewingRequest: { page: PageMetadata; request: any } | null;
  onClose: () => void;
}

export default function ViewEditRequestModal({
  viewingRequest,
  onClose,
}: ViewEditRequestModalProps) {
  if (!viewingRequest) return null;

  const { page, request } = viewingRequest;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-blue-300 bg-blue-100 text-blue-700">
                <FileEdit className="w-3 h-3 mr-1.5" />
                Edit Request
              </Badge>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors text-gray-500 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">
            Review Proposed Changes
          </h2>
          <p className="text-sm text-gray-600">
            For article: <span className="font-semibold text-gray-900">{page.title}</span>
          </p>
        </div>

        <div className="p-8 space-y-6">

          {/* Request Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                <span className="font-mono font-semibold">Request ID</span>
              </div>
              <div className="text-xl font-mono font-bold text-gray-900">
                #{request.requestId}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                <Calendar className="w-3 h-3" />
                <span>Submitted</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {formatDate(request.createdAt)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                <User className="w-3 h-3" />
                <span>Requester</span>
              </div>
              <div className="font-mono text-sm font-semibold text-gray-900">
                {formatAddress(request.requester)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                <AlertCircle className="w-3 h-3" />
                <span>Status</span>
              </div>
              <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-700 capitalize">
                {request.status}
              </Badge>
            </div>
          </div>

          {/* Content Preview */}
          <div>
            <h3 className="text-lg font-serif font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileEdit className="w-5 h-5 text-gray-600" />
              Proposed Changes
            </h3>
            
            {request.content ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-h-[500px] overflow-y-auto">
                <article className="prose prose-sm max-w-none markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {request.content}
                  </ReactMarkdown>
                </article>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <p className="text-gray-700 font-medium mb-2">
                  Content not loaded
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Please click &quot;View Content&quot; button to load.
                </p>
                <div className="text-xs text-gray-500">
                  Walrus Blob ID: <span className="font-mono font-semibold">{request.newWalrusBlobId}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

