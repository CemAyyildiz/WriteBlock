interface AdminInfoCardProps {
  currentAccount: any;
  adminCapId: string | null;
  formatAddress: (address: string) => string;
}

export default function AdminInfoCard({
  currentAccount,
  adminCapId,
  formatAddress,
}: AdminInfoCardProps) {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-purple-600 text-white shadow-lg">
            <span className="text-3xl">👑</span>
          </div>
          <div>
            <div className="text-sm font-medium text-purple-600 mb-1">
              Admin Address
            </div>
            <div className="font-mono text-lg font-bold text-gray-900">
              {currentAccount
                ? formatAddress(currentAccount.address)
                : 'Not connected'
              }
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-purple-600 mb-1">
            Authority Status
          </div>
          <div className={`font-bold text-lg ${adminCapId ? 'text-purple-700' : 'text-red-600'}`}>
            {adminCapId ? 'Admin_Capability ✓' : 'No Admin Capability ⚠️'}
          </div>
        </div>
      </div>
    </div>
  );
}

