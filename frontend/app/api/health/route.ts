import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'WriteBlock Backend API is running',
    environment: {
      storage: process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'not set',
      blockchain: process.env.NEXT_PUBLIC_BLOCKCHAIN_PROVIDER || 'not set',
      wallet: process.env.NEXT_PUBLIC_WALLET_PROVIDER || 'not set',
      sui_network: process.env.NEXT_PUBLIC_SUI_NETWORK || 'not set',
      package_id: process.env.NEXT_PUBLIC_PACKAGE_ID ? '✅ set' : '❌ not set',
      registry_id: process.env.NEXT_PUBLIC_REGISTRY_ID ? '✅ set' : '❌ not set',
    },
    endpoints: {
      upload: '/api/walrus/upload',
      download: '/api/walrus/download',
      health: '/api/health',
    },
  });
}
