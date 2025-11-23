interface HeaderSectionProps {
  totalPages: number;
}

export default function HeaderSection({ totalPages }: HeaderSectionProps) {
  return (
    <div className="mb-12">
      <div className="flex items-end justify-between">
        <div>
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-navy-100 to-navy-50 dark:from-navy-900 dark:to-navy-800 border border-navy-200 dark:border-navy-700">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
            <span className="text-sm font-semibold text-navy-700 dark:text-navy-300">Live on Sui Blockchain</span>
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-navy-800 to-navy-600 dark:from-navy-200 dark:to-navy-400 bg-clip-text text-transparent">
            Published Articles
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Decentralized content powered by Walrus storage
          </p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold bg-gradient-to-br from-neon-green to-neon-cyan bg-clip-text text-transparent mb-1">
            {totalPages}
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Total Posts
          </div>
        </div>
      </div>
    </div>
  );
}

