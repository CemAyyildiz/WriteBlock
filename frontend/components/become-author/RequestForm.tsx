import { useState } from 'react';

interface RequestFormProps {
  requesterAddress: string;
  onSubmit: (data: { name: string; bio: string; reason: string }) => Promise<void>;
  isSubmitting: boolean;
}

export default function RequestForm({ requesterAddress, onSubmit, isSubmitting }: RequestFormProps) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, bio, reason });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
          Your Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={50}
          placeholder="e.g., John Doe"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-semibold text-gray-900 mb-2">
          Short Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
          rows={3}
          placeholder="Tell us about yourself (optional)"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">{bio.length}/200 characters</p>
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-semibold text-gray-900 mb-2">
          Why do you want to become an author? *
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          maxLength={500}
          rows={4}
          placeholder="Share your motivation and what you plan to write about..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">{reason.length}/500 characters</p>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-4">
          Your wallet address: <span className="font-mono text-gray-700">{requesterAddress}</span>
        </p>
        <button
          type="submit"
          disabled={isSubmitting || !name.trim() || !reason.trim()}
          className="w-full px-6 py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSubmitting ? 'Submitting Request...' : 'Submit Author Request'}
        </button>
      </div>
    </form>
  );
}

