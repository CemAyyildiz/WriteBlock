import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@mysten/dapp-kit/dist/index.css';
import { Providers } from '@/components/Providers';
import { SidebarProvider } from '@/components/SidebarLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WriteBlock - Decentralized Publishing',
  description: 'A decentralized publishing platform built on Sui blockchain with Walrus storage',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}

