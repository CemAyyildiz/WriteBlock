'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';
import { Home, PenTool, Shield, User, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getWalletClient } from '@/lib/client';
import { useSidebar } from './SidebarLayout';

export default function Sidebar() {
  const pathname = usePathname();
  const currentAccount = useCurrentAccount();
  const [userRole, setUserRole] = useState<string>('viewer');
  const { isOpen, setIsOpen } = useSidebar();

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
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col z-40
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-0 lg:w-20'}
      `}>
        {/* Logo & Toggle */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <Link href="/" className="block overflow-hidden" onClick={() => setIsOpen(false)}>
            {isOpen ? (
              <>
                <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-tight whitespace-nowrap">
                  WriteBlock
                </h1>
                <p className="text-xs text-gray-500 mt-1">Decentralized Publishing</p>
              </>
            ) : (
              <div className="hidden lg:flex w-8 h-8 items-center justify-center bg-gray-900 text-white rounded-lg font-bold text-sm">
                W
              </div>
            )}
          </Link>
          
          {/* Desktop Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-hidden">
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
            isActive('/')
              ? 'bg-gray-100 text-gray-900 font-medium'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          } ${!isOpen ? 'lg:justify-center lg:px-0' : ''}`}
          title={!isOpen ? 'Home' : ''}
        >
          <Home className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
          {isOpen && <span className="text-sm whitespace-nowrap">Home</span>}
        </Link>

        <Link
          href="/author"
          onClick={() => setIsOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
            isActive('/author')
              ? 'bg-gray-100 text-gray-900 font-medium'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          } ${!isOpen ? 'lg:justify-center lg:px-0' : ''}`}
          title={!isOpen ? 'Write' : ''}
        >
          <PenTool className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
          {isOpen && <span className="text-sm whitespace-nowrap">Write</span>}
        </Link>

        <Link
          href="/admin"
          onClick={() => setIsOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
            isActive('/admin')
              ? 'bg-gray-100 text-gray-900 font-medium'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          } ${!isOpen ? 'lg:justify-center lg:px-0' : ''}`}
          title={!isOpen ? 'Admin' : ''}
        >
          <Shield className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
          {isOpen && <span className="text-sm whitespace-nowrap">Admin</span>}
        </Link>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 space-y-4 overflow-hidden">
        {/* User Role */}
        {currentAccount && (
          <div className={`flex items-center gap-3 px-4 py-2 ${!isOpen ? 'lg:justify-center lg:px-0' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <Badge variant="secondary" className="text-xs font-normal capitalize">
                  {userRole}
                </Badge>
              </div>
            )}
          </div>
        )}

        {isOpen && <Separator />}

        {/* Wallet Connect */}
        <div className={`${isOpen ? 'px-2' : 'hidden lg:flex lg:justify-center'}`}>
          <ConnectButton />
        </div>
      </div>
      </aside>
    </>
  );
}

