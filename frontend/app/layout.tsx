import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@mysten/dapp-kit/dist/index.css';
import { Providers } from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WriteBlock - Decentralized CMS',
  description: 'A decentralized content management system built on Sui blockchain with Walrus storage',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

