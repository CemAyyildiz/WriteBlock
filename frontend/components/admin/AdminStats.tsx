import { Author, AuthorRequest } from '@/types';

interface AdminStatsProps {
  authors: Author[];
  authorRequests: AuthorRequest[];
}

export default function AdminStats({ authors, authorRequests }: AdminStatsProps) {
  const pendingRequests = authorRequests.filter(r => r.status === 'pending').length;
  const approvedRequests = authorRequests.filter(r => r.status === 'approved').length;
  const rejectedRequests = authorRequests.filter(r => r.status === 'rejected').length;

  const stats = [
    {
      label: 'Total Authors',
      value: authors.length,
      icon: '✍️',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Pending Requests',
      value: pendingRequests,
      icon: '⏳',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Approved',
      value: approvedRequests,
      icon: '✅',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Rejected',
      value: rejectedRequests,
      icon: '❌',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.bg} border border-gray-200 rounded-lg p-6 text-center`}
        >
          <div className="text-3xl mb-2">{stat.icon}</div>
          <div className={`text-3xl font-bold ${stat.color} mb-1`}>
            {stat.value}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

