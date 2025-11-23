'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';
import { Home, PenTool, Shield, User, FileText } from 'lucide-react';
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
    <aside 
      className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-24 flex flex-col items-center py-8 border-r-[4px]"
      style={{ 
        background: '#FFFFFF',
        borderColor: '#000000'
      }}
    >
      {/* Navigation Links */}
      <div className="flex flex-col items-center gap-8 flex-1">
        <Link
          href="/"
          className="group flex flex-col items-center gap-2 transition-all"
          title="Notes"
        >
          <div 
            className="p-4 border-[3px] transition-all brutal-rotate"
            style={{ 
              background: isActive('/') ? '#FFFF00' : '#FFFFFF',
              borderColor: '#000000',
              boxShadow: isActive('/') ? '3px 3px 0 #000000' : 'none',
              color: '#000000'
            }}
          >
            <FileText className="w-6 h-6" strokeWidth={3} />
          </div>
          <span 
            className="text-[10px] font-black uppercase tracking-wide"
            style={{ 
              color: '#000000'
            }}
          >
            Notes
          </span>
        </Link>

        <Link
          href="/author"
          className="group flex flex-col items-center gap-2 transition-all"
          title="Write"
        >
          <div 
            className="p-4 border-[3px] transition-all brutal-rotate"
            style={{ 
              background: isActive('/author') ? '#FFFF00' : '#FFFFFF',
              borderColor: '#000000',
              boxShadow: isActive('/author') ? '3px 3px 0 #000000' : 'none',
              color: '#000000'
            }}
          >
            <PenTool className="w-6 h-6" strokeWidth={3} />
          </div>
          <span 
            className="text-[10px] font-black uppercase tracking-wide"
            style={{ 
              color: '#000000'
            }}
          >
            Write
          </span>
        </Link>

        <Link
          href="/admin"
          className="group flex flex-col items-center gap-2 transition-all"
          title="Admin"
        >
          <div 
            className="p-4 border-[3px] transition-all brutal-rotate"
            style={{ 
              background: isActive('/admin') ? '#FFFF00' : '#FFFFFF',
              borderColor: '#000000',
              boxShadow: isActive('/admin') ? '3px 3px 0 #000000' : 'none',
              color: '#000000'
            }}
          >
            <Shield className="w-6 h-6" strokeWidth={3} />
          </div>
          <span 
            className="text-[10px] font-black uppercase tracking-wide"
            style={{ 
              color: '#000000'
            }}
          >
            Admin
          </span>
        </Link>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center gap-6">
        {/* Role Badge */}
        {currentAccount && (
          <>
            <div className="w-16 h-[3px]" style={{ background: '#000000' }} />
            <div className="flex flex-col items-center gap-2">
              <div 
                className="p-3 border-[3px]"
                style={{ 
                  background: '#FF00FF',
                  borderColor: '#000000',
                  color: '#000000',
                  boxShadow: '2px 2px 0 #000000'
                }}
              >
                <User className="w-6 h-6" strokeWidth={3} />
              </div>
              <span 
                className="text-[9px] font-black uppercase tracking-wider"
                style={{ color: '#000000' }}
              >
                {userRole}
              </span>
            </div>
          </>
        )}

        {/* Wallet Connect Button */}
        <div className="brutal-wallet-wrapper">
          <ConnectButton />
        </div>
      </div>
    </aside>
  );
}

