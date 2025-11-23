import { PageMetadata } from '@/types';

interface EditRequestsSectionProps {
  pages: PageMetadata[];
  editRequests: Map<number, any[]>;
  loadingRequestContent: boolean;
  processingRequest: { pageId: number; requestId: number } | null;
  onViewRequest: (page: PageMetadata, request: any) => void;
  onApproveRequest: (pageId: number, requestId: number) => void;
  onRejectRequest: (pageId: number, requestId: number) => void;
  formatAddress: (address: string) => string;
  formatDate: (timestamp: number) => string;
}

export default function EditRequestsSection({
  pages,
  editRequests,
  loadingRequestContent,
  processingRequest,
  onViewRequest,
  onApproveRequest,
  onRejectRequest,
  formatAddress,
  formatDate,
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
    <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
      <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
        📝 Edit Requests ({totalRequests})
      </h2>
      <div className="space-y-4">
        {allRequests.map(({ page, requests }) => (
          <div key={page.page_id} className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              {page.title} ({requests.length} request{requests.length > 1 ? 's' : ''})
            </h3>
            <div className="space-y-3">
              {requests.map((request, idx) => (
                <div key={request?.requestId ?? idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        Request #{request?.requestId ?? 'N/A'} from {formatAddress(request?.requester)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(request.createdAt)}
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                  
                  {request.excerpt && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {request.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewRequest(page, request)}
                      disabled={loadingRequestContent}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loadingRequestContent ? '⏳ Loading...' : '👁️ View Content'}
                    </button>
                    <button
                      onClick={() => onApproveRequest(page.page_id, request.requestId)}
                      disabled={processingRequest?.pageId === page.page_id && processingRequest?.requestId === request.requestId}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {processingRequest?.pageId === page.page_id && processingRequest?.requestId === request.requestId ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>✅</span>
                          <span>Approve</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => onRejectRequest(page.page_id, request.requestId)}
                      disabled={processingRequest?.pageId === page.page_id && processingRequest?.requestId === request.requestId}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      ❌ Reject
                    </button>
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

