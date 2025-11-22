'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';
import { getWalletClient } from '@/lib/client';

export default function Navbar() {
  const pathname = usePathname();
  const currentAccount = useCurrentAccount();
  const [userRole, setUserRole] = useState<string>('viewer');

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  // Fetch user capabilities when wallet is connected
  useEffect(() => {
    async function fetchCapabilities() {
      if (!currentAccount?.address) {
        setUserRole('viewer');
        return;
      }

      try {
        const wallet = getWalletClient();
        const caps = await wallet.getUserCapabilities(currentAccount.address);
        
        if (caps.hasAdminCap) {
          setUserRole('admin');
        } else if (caps.hasAuthorCap) {
          setUserRole('author');
        } else {
          setUserRole('viewer');
        }
      } catch (error) {
        console.error('Error fetching capabilities:', error);
        setUserRole('viewer');
      }
    }

    fetchCapabilities();
  }, [currentAccount?.address]);

  return (
    <nav className="frosted-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group transition-all duration-300">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-navy-600 to-navy-800 shadow-lg">
              <span className="text-white font-bold text-2xl relative z-10">W</span>
              <div className="absolute inset-0 bg-gradient-to-br from-neon-green to-neon-cyan opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-navy-700 to-navy-900 dark:from-navy-300 dark:to-navy-100 bg-clip-text text-transparent">
                WriteBlock
              </span>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Decentralized CMS
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className={`group relative px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                isActive('/')
                  ? 'text-navy-700 dark:text-navy-300'
                  : 'text-gray-600 hover:text-navy-600 dark:text-gray-400 dark:hover:text-navy-400'
              }`}
            >
              {isActive('/') && (
                <div className="absolute inset-0 bg-gradient-to-r from-navy-100 to-navy-50 dark:from-navy-900 dark:to-navy-800 rounded-xl"></div>
              )}
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-base">📚</span>
                <span>Articles</span>
              </span>
            </Link>

            <Link
              href="/author"
              className={`group relative px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                isActive('/author')
                  ? 'text-navy-700 dark:text-navy-300'
                  : 'text-gray-600 hover:text-navy-600 dark:text-gray-400 dark:hover:text-navy-400'
              }`}
            >
              {isActive('/author') && (
                <div className="absolute inset-0 bg-gradient-to-r from-navy-100 to-navy-50 dark:from-navy-900 dark:to-navy-800 rounded-xl"></div>
              )}
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-base">✍️</span>
                <span>Write</span>
              </span>
            </Link>

            <Link
              href="/admin"
              className={`group relative px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                isActive('/admin')
                  ? 'text-navy-700 dark:text-navy-300'
                  : 'text-gray-600 hover:text-navy-600 dark:text-gray-400 dark:hover:text-navy-400'
              }`}
            >
              {isActive('/admin') && (
                <div className="absolute inset-0 bg-gradient-to-r from-navy-100 to-navy-50 dark:from-navy-900 dark:to-navy-800 rounded-xl"></div>
              )}
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-base">👑</span>
                <span>Admin</span>
              </span>
            </Link>

            {/* Wallet Connect Button & Role Badge */}
            <div className="ml-4 flex items-center gap-3">

            {/* Role Badge */}
              {currentAccount && (
                <div className="neon-badge">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
                  <span className="font-mono text-xs capitalize">{userRole}</span>
                </div>
              )}
              
              {/* Wallet Connect Button */}
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
