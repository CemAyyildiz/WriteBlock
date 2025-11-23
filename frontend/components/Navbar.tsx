'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';
import { Home, PenTool, Shield, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-2xl font-serif font-bold text-gray-900 tracking-tight hover:text-gray-700 transition-colors">
              WriteBlock
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`flex items-center gap-2 text-sm transition-colors duration-200 ${
                isActive('/')
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Home className="w-4 h-4" strokeWidth={1.5} />
              <span>Home</span>
            </Link>

            <Link
              href="/author"
              className={`flex items-center gap-2 text-sm transition-colors duration-200 ${
                isActive('/author')
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <PenTool className="w-4 h-4" strokeWidth={1.5} />
              <span>Write</span>
            </Link>

            <Link
              href="/admin"
              className={`flex items-center gap-2 text-sm transition-colors duration-200 ${
                isActive('/admin')
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Shield className="w-4 h-4" strokeWidth={1.5} />
              <span>Admin</span>
            </Link>

            {/* Divider */}
            <Separator orientation="vertical" className="h-6" />

            {/* Role Badge */}
            {currentAccount && (
              <Badge variant="secondary" className="gap-1.5 font-normal">
                <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span className="font-mono text-xs capitalize">{userRole}</span>
              </Badge>
            )}
            
            {/* Wallet Connect Button */}
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
