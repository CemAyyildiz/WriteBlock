/**
 * Walrus Download API Route
 * Bu endpoint browser'dan gelen download isteklerini Walrus aggregator'a yönlendirir
 * CORS problemini çözer ve alternatif endpoint'leri dener
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const blobId = searchParams.get('blobId');
    
    if (!blobId) {
      return NextResponse.json(
        { error: 'Blob ID is required' },
        { status: 400 }
      );
    }

    // Alternatif aggregator endpoint'leri (dökümantasyona göre)
    const aggregatorUrls = [
      process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space',
      'https://walrus-testnet-aggregator.nodes.guru',
      'https://walrus-testnet-aggregator.bartestnet.com',
      'https://aggregator-testnet.walrus.space',
    ];

    console.log('🐋 Downloading blob:', blobId);

    // Her aggregator'ı dene
    for (const aggregatorUrl of aggregatorUrls) {
      try {
        // Önce /v1/{blobId} formatını dene
        let url = `${aggregatorUrl}/v1/${blobId}`;
        console.log(`  Trying: ${url}`);
        
        let response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/octet-stream, text/plain, */*',
          },
        });

        // Eğer 404 ise, /v1/blobs/{blobId} formatını dene
        if (response.status === 404) {
          url = `${aggregatorUrl}/v1/blobs/${blobId}`;
          console.log(`  Trying alternative format: ${url}`);
          response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/octet-stream, text/plain, */*',
            },
          });
        }

        if (response.ok) {
          const content = await response.text();
          console.log(`✅ Download successful from ${aggregatorUrl}, size: ${content.length}`);
          
          return new NextResponse(content, {
            status: 200,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
            },
          });
        } else {
          console.log(`  ❌ ${aggregatorUrl} returned ${response.status}`);
        }
      } catch (error: any) {
        console.log(`  ❌ ${aggregatorUrl} failed: ${error.message}`);
        continue;
      }
    }

    // Tüm aggregator'lar başarısız oldu
    return NextResponse.json(
      { 
        error: 'Blob not found on any aggregator',
        blobId,
        triedUrls: aggregatorUrls.map(url => [`${url}/v1/${blobId}`, `${url}/v1/blobs/${blobId}`]).flat(),
      },
      { status: 404 }
    );

  } catch (error: any) {
    console.error('❌ API Route error:', error);
    
    return NextResponse.json(
      { 
        error: 'Download failed',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

