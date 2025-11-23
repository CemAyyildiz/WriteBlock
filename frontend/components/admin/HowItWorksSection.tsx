export default function HowItWorksSection() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900">
          How It Works
        </h2>
      </div>

      <div className="p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 text-white font-bold shadow-lg">
            1
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">
              Admin Capability Check
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Only Admin_Capability holders can perform this operation
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 text-white font-bold shadow-lg">
            2
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">
              Mint Author_Capability
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              A new Author_Capability object is created on-chain
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 text-white font-bold shadow-lg">
            3
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">
              Transfer to Author
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Capability is transferred to the specified address
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-sm text-gray-700">
            <strong className="text-gray-900">Important:</strong> Author_Capability is non-copyable and non-droppable, ensuring secure permission management.
          </p>
        </div>
      </div>
    </div>
  );
}

