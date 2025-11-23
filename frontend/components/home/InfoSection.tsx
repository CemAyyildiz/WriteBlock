import Link from 'next/link';

export default function InfoSection() {
  return (
    <div className="mt-16 glass-card p-8">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 flex items-center justify-center border border-neon-green/30">
          <span className="text-3xl">ℹ️</span>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-navy-800 dark:text-navy-200 mb-3">
            Decentralized Content Management
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            All articles on this platform are stored with metadata on the Sui blockchain and content on 
            Walrus distributed storage. This ensures permanent, censorship-resistant publishing.
          </p>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-700 transition-colors"
            >
              <span>👑</span>
              <span>Admin Panel</span>
            </Link>
            <Link
              href="/author"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-700 transition-colors"
            >
              <span>✍️</span>
              <span>Author Panel</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

