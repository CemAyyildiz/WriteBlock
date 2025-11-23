'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';
import { Home, PenTool, Shield, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getWalletClient } from '@/lib/client';

export default function Sidebar() {
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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="block">
          <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">
            WriteBlock
          </h1>
          <p className="text-xs text-gray-500 mt-1">Decentralized Publishing</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <Link
          href="/"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
            isActive('/')
              ? 'bg-gray-100 text-gray-900 font-medium'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Home className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm">Home</span>
        </Link>

        <Link
          href="/author"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
            isActive('/author')
              ? 'bg-gray-100 text-gray-900 font-medium'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <PenTool className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm">Write</span>
        </Link>

        <Link
          href="/admin"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
            isActive('/admin')
              ? 'bg-gray-100 text-gray-900 font-medium'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Shield className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm">Admin</span>
        </Link>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 space-y-4">
        {/* User Role */}
        {currentAccount && (
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <Badge variant="secondary" className="text-xs font-normal capitalize">
                {userRole}
              </Badge>
            </div>
          </div>
        )}

        <Separator />

        {/* Wallet Connect */}
        <div className="px-2">
          <ConnectButton />
        </div>
      </div>
    </aside>
  );
}

