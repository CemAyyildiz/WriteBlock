export default function InfoSection() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-8">
      <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
        Becoming an Author
      </h2>
      
      <div className="space-y-6 text-gray-700">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span>📝</span>
            <span>What can authors do?</span>
          </h3>
          <ul className="space-y-2 ml-8 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span>Create and publish articles on the blockchain</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span>Update your own articles with new versions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span>Review and approve edit suggestions from readers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span>Manage your content with full ownership</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span>🔐</span>
            <span>On-chain verification</span>
          </h3>
          <p className="text-sm ml-8 leading-relaxed">
            All articles are stored on Walrus decentralized storage and verified on the Sui blockchain.
            Your author capability is an on-chain credential that proves your publishing rights.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span>⏱️</span>
            <span>Review process</span>
          </h3>
          <p className="text-sm ml-8 leading-relaxed">
            After submitting your request, the admin team will review your application.
            You&apos;ll receive author capabilities once approved. The process typically takes 1-2 days.
          </p>
        </div>
      </div>
    </div>
  );
}

