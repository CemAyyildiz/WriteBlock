import { useState } from 'react';
import { isValidSuiAddress } from '@/lib/utils/format';

interface DirectGrantFormProps {
  onGrant: (address: string, name: string) => Promise<void>;
  isGranting: boolean;
  existingAuthors: string[];
}

export default function DirectGrantForm({ onGrant, isGranting, existingAuthors }: DirectGrantFormProps) {
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!address.trim() || !name.trim()) {
      setError('Please fill all fields');
      return;
    }

    if (!isValidSuiAddress(address)) {
      setError('Invalid Sui address format');
      return;
    }

    if (existingAuthors.some(a => a.toLowerCase() === address.toLowerCase())) {
      setError('This address already has author capability');
      return;
    }

    await onGrant(address, name);
    
    // Reset form on success
    setAddress('');
    setName('');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Direct Author Grant
        </h3>
        <p className="text-sm text-gray-600">
          Grant author capability directly to an address without requiring a request.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="author-name" className="block text-sm font-medium text-gray-900 mb-2">
            Author Name
          </label>
          <input
            type="text"
            id="author-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., John Doe"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
            disabled={isGranting}
          />
        </div>

        <div>
          <label htmlFor="author-address" className="block text-sm font-medium text-gray-900 mb-2">
            Wallet Address
          </label>
          <input
            type="text"
            id="author-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 font-mono text-sm"
            disabled={isGranting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Must be a valid Sui address (0x... 66 characters)
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isGranting}
          className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGranting ? 'Granting...' : 'Grant Author Capability'}
        </button>
      </form>
    </div>
  );
}

