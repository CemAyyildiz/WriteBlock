import { formatDate } from '@/lib/utils/format';

interface StatusCardProps {
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
  processedAt?: number;
}

export default function StatusCard({ status, submittedAt, processedAt }: StatusCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: '⏳',
          title: 'Request Pending',
          description: 'Your author request is under review by the admin team.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
        };
      case 'approved':
        return {
          icon: '✅',
          title: 'Request Approved!',
          description: 'Congratulations! You now have author capabilities.',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
        };
      case 'rejected':
        return {
          icon: '❌',
          title: 'Request Rejected',
          description: 'Your author request was not approved. You can submit a new request.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`${config.bgColor} border-2 ${config.borderColor} rounded-lg p-6`}>
      <div className="flex items-start gap-4">
        <span className="text-4xl">{config.icon}</span>
        <div className="flex-1">
          <h3 className={`text-xl font-bold ${config.textColor} mb-2`}>
            {config.title}
          </h3>
          <p className="text-gray-700 mb-4 leading-relaxed">
            {config.description}
          </p>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <dt className="text-gray-600">Submitted:</dt>
              <dd className="font-medium text-gray-900">{formatDate(submittedAt)}</dd>
            </div>
            {processedAt && processedAt > 0 && (
              <div className="flex items-center gap-2">
                <dt className="text-gray-600">Processed:</dt>
                <dd className="font-medium text-gray-900">{formatDate(processedAt)}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}

