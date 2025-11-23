import { Input } from '@/components/ui/input';

interface GrantAuthorFormProps {
  newAuthorName: string;
  newAuthorAddress: string;
  isGranting: boolean;
  onNameChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onSubmit: () => void;
}

export default function GrantAuthorForm({
  newAuthorName,
  newAuthorAddress,
  isGranting,
  onNameChange,
  onAddressChange,
  onSubmit,
}: GrantAuthorFormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900">
          Add New Author
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Grant Author_Capability permission
        </p>
      </div>

      <div className="p-8 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Author Name
          </label>
          <Input
            type="text"
            value={newAuthorName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g., Alice Writer"
            className="text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Sui Wallet Address
          </label>
          <Input
            type="text"
            value={newAuthorAddress}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="0x..."
            className="font-mono text-base"
          />
          <p className="text-xs text-gray-500 mt-2">
            66 characters long, starting with 0x
          </p>
        </div>

        <button
          onClick={onSubmit}
          disabled={isGranting || !newAuthorAddress || !newAuthorName}
          className="w-full px-6 py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGranting ? (
            <>
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Authorizing...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>Grant Author Permission</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

