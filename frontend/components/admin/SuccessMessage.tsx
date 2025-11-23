interface SuccessMessageProps {
  txHash: string;
}

export default function SuccessMessage({ txHash }: SuccessMessageProps) {
  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 mb-8">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-green-600 flex items-center justify-center shadow-lg">
          <span className="text-3xl">✅</span>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Author Permission Granted!
          </h3>
          <p className="text-gray-600 mb-4">
            Author_Capability has been created and transferred to the specified address.
          </p>
          
          <div className="p-4 rounded-lg bg-white border border-green-200">
            <div className="text-xs font-semibold text-gray-500 mb-2">
              Sui Transaction Hash
            </div>
            <div className="font-mono text-sm text-gray-900 break-all">
              {txHash}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

