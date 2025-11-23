'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { Home, PenTool, Shield, User, Menu, X, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useWalletCapabilities } from '@/lib/hooks/useWalletCapabilities';
import { useSidebar } from './SidebarLayout';
import LogoAnimation from './LogoAnimation';

export default function Sidebar() {
  const pathname = usePathname();
  const currentAccount = useCurrentAccount();
  const { role: userRole } = useWalletCapabilities();
  const { isOpen, setIsOpen } = useSidebar();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

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
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-center">
          <Link href="/" className="block overflow-hidden">
            {isOpen ? (
              <div className="flex items-center gap-3">
                <LogoAnimation size="sm" />
                <div>
                  <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-tight whitespace-nowrap">
                    WriteBlock
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">Decentralized Publishing</p>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center justify-center">
                <LogoAnimation size="sm" />
              </div>
            )}
          </Link>
        </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-hidden relative">
        <Link
          href="/"
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

        {userRole === 'author' || userRole === 'admin' ? (
          <Link
            href="/author"
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
        ) : (
          <Link
            href="/become-author"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              isActive('/become-author')
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            } ${!isOpen ? 'lg:justify-center lg:px-0' : ''}`}
            title={!isOpen ? 'Become Author' : ''}
          >
            <UserPlus className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
            {isOpen && <span className="text-sm whitespace-nowrap">Become Author</span>}
          </Link>
        )}

        {userRole === 'admin' && (
          <Link
            href="/admin"
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
        )}

        {/* Desktop Toggle Button - Middle of sidebar */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden lg:flex absolute top-1/2 -translate-y-1/2 -right-3 p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm z-50"
          aria-label="Toggle sidebar"
        >
          {isOpen ? (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>
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

