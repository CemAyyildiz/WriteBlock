import { PageMetadata } from '@/types';
import { formatAddress, formatDate } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { Eye, Check, X, FileEdit } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface EditRequestsSectionProps {
  pages: PageMetadata[];
  editRequests: Map<number, any[]>;
  loadingRequestContent: boolean;
  processingRequest: { pageId: number; requestId: number } | null;
  onViewRequest: (page: PageMetadata, request: any) => void;
  onApproveRequest: (pageId: number, requestId: number) => void;
  onRejectRequest: (pageId: number, requestId: number) => void;
}

export default function EditRequestsSection({
  pages,
  editRequests,
  loadingRequestContent,
  processingRequest,
  onViewRequest,
  onApproveRequest,
  onRejectRequest,
}: EditRequestsSectionProps) {
  const allRequests: Array<{ page: PageMetadata; requests: any[] }> = [];
  
  pages.forEach(page => {
    const requests = editRequests.get(page.page_id) || [];
    const pendingRequests = requests.filter(r => r.status === 'pending');
    if (pendingRequests.length > 0) {
      allRequests.push({ page, requests: pendingRequests });
    }
  });

  if (allRequests.length === 0) return null;

  const totalRequests = allRequests.reduce((sum, item) => sum + item.requests.length, 0);

  return (
    <div className="mb-8 bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-100">
                <FileEdit className="w-3 h-3 mr-1.5" />
                Pending Review
              </Badge>
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900">
              Edit Requests
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and approve suggested changes from the community
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-serif font-bold text-amber-600">
              {totalRequests}
            </div>
            <div className="text-xs text-gray-600">
              {totalRequests === 1 ? 'Request' : 'Requests'}
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="p-6 space-y-6">
        {allRequests.map(({ page, requests }) => (
          <div key={page.page_id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Article Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {page.title}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {requests.length} {requests.length === 1 ? 'request' : 'requests'}
                </Badge>
              </div>
            </div>

            {/* Request Cards */}
            <div className="divide-y divide-gray-200">
              {requests.map((request, idx) => (
                <div key={request?.requestId ?? idx} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="space-y-3">
                    {/* Request Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">
                            Request #{request?.requestId ?? 'N/A'}
                          </span>
                          <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-700">
                            Pending
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>From</span>
                          <span className="font-mono font-medium text-gray-700">
                            {formatAddress(request?.requester)}
                          </span>
                          <span>•</span>
                          <span>{formatDate(request.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Excerpt Preview */}
                    {request.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-2 pl-4 border-l-2 border-gray-200">
                        {request.excerpt}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => onViewRequest(page, request)}
                        disabled={loadingRequestContent}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {loadingRequestContent ? (
                          <>
                            <LoadingSpinner size="xs" />
                            <span>Loading...</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            <span>View Content</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => onApproveRequest(page.page_id, request.requestId)}
                        disabled={processingRequest?.pageId === page.page_id && processingRequest?.requestId === request.requestId}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {processingRequest?.pageId === page.page_id && processingRequest?.requestId === request.requestId ? (
                          <>
                            <LoadingSpinner size="xs" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Approve</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => onRejectRequest(page.page_id, request.requestId)}
                        disabled={processingRequest?.pageId === page.page_id && processingRequest?.requestId === request.requestId}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

