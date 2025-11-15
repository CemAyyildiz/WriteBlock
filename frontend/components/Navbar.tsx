'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">W</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                WriteBlock
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-1">
            <Link
              href="/viewer"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/viewer')
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              📖 Okuma
            </Link>
            <Link
              href="/author"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/author')
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              ✍️ Yazma
            </Link>
            <Link
              href="/admin"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/admin')
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              👑 Yönetici
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

