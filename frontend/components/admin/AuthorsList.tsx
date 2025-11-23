import { Author } from '@/types';

interface AuthorsListProps {
  authors: Author[];
  formatAddress: (address: string) => string;
  formatDate: (timestamp: number) => string;
}

export default function AuthorsList({
  authors,
  formatAddress,
  formatDate,
}: AuthorsListProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Authorized Authors
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Users with Author_Capability
            </p>
          </div>
          <div className="px-4 py-2 bg-gray-900 text-white rounded-full font-semibold text-lg">
            {authors.length} {authors.length === 1 ? 'Author' : 'Authors'}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {authors.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✍️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Authors Yet
            </h3>
            <p className="text-gray-600">
              Grant author permissions to start building your writing community.
            </p>
          </div>
        ) : (
          authors.map((author) => (
            <div key={author.address} className="p-6 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <span className="text-2xl">✍️</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {author.name}
                    </h3>
                    <div className="font-mono text-sm text-gray-600">
                      {formatAddress(author.address)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-gray-500 mb-2">
                    Permission Granted
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(author.granted_at)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

