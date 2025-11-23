import { useState } from 'react';
import { AuthorRequest } from '@/types';
import { formatAddress, formatDate } from '@/lib/utils/format';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface AuthorRequestsListProps {
  requests: AuthorRequest[];
  onApprove: (request: AuthorRequest) => void;
  onReject: (request: AuthorRequest) => void;
  processing: string | null;
}

export default function AuthorRequestsList({
  requests,
  onApprove,
  onReject,
  processing,
}: AuthorRequestsListProps) {
  const [showProcessed, setShowProcessed] = useState(false);
  
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (requests.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <span className="text-5xl mb-4 block">📭</span>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Author Requests
        </h3>
        <p className="text-gray-600">
          There are no author requests at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>⏳</span>
            <span>Pending Requests ({pendingRequests.length})</span>
          </h3>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onApprove={onApprove}
                onReject={onReject}
                isProcessing={processing === request.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Processed Requests - Collapsible */}
      {processedRequests.length > 0 && (
        <div>
          <button
            onClick={() => setShowProcessed(!showProcessed)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors mb-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span>📋</span>
              <span>Processed Requests ({processedRequests.length})</span>
            </h3>
            {showProcessed ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </button>
          
          {showProcessed && (
            <div className="space-y-4 mb-6">
              {processedRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onApprove={onApprove}
                  onReject={onReject}
                  isProcessing={false}
                  readonly
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface RequestCardProps {
  request: AuthorRequest;
  onApprove: (request: AuthorRequest) => void;
  onReject: (request: AuthorRequest) => void;
  isProcessing: boolean;
  readonly?: boolean;
}

function RequestCard({ request, onApprove, onReject, isProcessing, readonly }: RequestCardProps) {
  const statusConfig = {
    pending: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
    approved: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
    rejected: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
  };

  const config = statusConfig[request.status];

  return (
    <div className={`${config.bg} border-2 ${config.border} rounded-lg p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-1">
            {request.name}
          </h4>
          <p className="text-xs font-mono text-gray-600">
            {formatAddress(request.requester)}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.text} bg-white border ${config.border}`}>
          {request.status.toUpperCase()}
        </span>
      </div>

      {request.bio && (
        <div className="mb-3">
          <p className="text-sm text-gray-700 italic">"{request.bio}"</p>
        </div>
      )}

      <div className="mb-4 p-4 bg-white rounded border border-gray-200">
        <p className="text-xs font-semibold text-gray-500 mb-2">Why they want to become an author:</p>
        <p className="text-sm text-gray-800 leading-relaxed">{request.reason}</p>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
        <span>Submitted: {formatDate(request.createdAt)}</span>
        {request.processedAt && (
          <span>Processed: {formatDate(request.processedAt)}</span>
        )}
      </div>

      {!readonly && request.status === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={() => onApprove(request)}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isProcessing ? 'Processing...' : '✓ Approve'}
          </button>
          <button
            onClick={() => onReject(request)}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isProcessing ? 'Processing...' : '✕ Reject'}
          </button>
        </div>
      )}
    </div>
  );
}

