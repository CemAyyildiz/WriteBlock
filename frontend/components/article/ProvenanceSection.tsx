interface ProvenanceSectionProps {
  pageId: number;
  version: number;
  walrusBlobId: string;
  author: string;
}

export default function ProvenanceSection({ pageId, version, walrusBlobId, author }: ProvenanceSectionProps) {
  return (
    <div className="border-t border-gray-200 pt-12 mb-12">
      <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">
        Blockchain Provenance
      </h2>

      <div className="bg-gray-50 rounded-lg p-8 mb-8">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              Page ID
            </div>
            <div className="font-mono text-lg font-bold text-gray-900">
              #{pageId}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              Version
            </div>
            <div className="font-mono text-lg font-bold text-gray-900">
              v{version}
            </div>
          </div>

          <div className="sm:col-span-2">
            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              Walrus Blob ID
            </div>
            <div className="font-mono text-sm text-gray-700 break-all">
              {walrusBlobId}
            </div>
          </div>

          <div className="sm:col-span-2">
            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              Author Address
            </div>
            <div className="font-mono text-sm text-gray-700 break-all">
              {author}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
            <span className="text-green-800">✓</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">
              Verified on Blockchain
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              This story is permanently stored on Sui blockchain with content on Walrus decentralized storage. 
              The author address and version number guarantee authenticity and immutability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

