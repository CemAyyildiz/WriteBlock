/**
 * Walrus Upload API Route
 * Bu endpoint browser'dan gelen upload isteklerini Walrus'a yönlendirir
 * CORS problemini çözer
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Request'ten content'i al
    const body = await request.text();
    
    if (!body) {
      return NextResponse.json(
        { error: 'No content provided' },
        { status: 400 }
      );
    }

    // Walrus publisher URL - Resmi publisher kullan
    const publisherUrl = process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL 
      || 'https://publisher.walrus-testnet.walrus.space';

    console.log('📤 Uploading to Walrus:', publisherUrl);
    console.log('📦 Content size:', body.length, 'bytes');

    // Walrus'a PUT request gönder (doğru endpoint: /v1/blobs)
    // Query parametreleri: epochs=5 (5 epoch sakla)
    const walrusResponse = await fetch(`${publisherUrl}/v1/blobs?epochs=5`, {
      method: 'PUT',
      body: body,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });

    if (!walrusResponse.ok) {
      const errorText = await walrusResponse.text();
      console.error('❌ Walrus upload failed:', walrusResponse.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'Walrus upload failed',
          status: walrusResponse.status,
          details: errorText 
        },
        { status: walrusResponse.status }
      );
    }

    // Walrus response'u parse et
    const result = await walrusResponse.json();
    console.log('📋 Full Walrus response:', JSON.stringify(result, null, 2));
    
    // Blob ID'yi çıkar
    let blobId: string;
    
    if (result.newlyCreated?.blobObject?.blobId) {
      blobId = result.newlyCreated.blobObject.blobId;
      console.log('✅ NEW blob created:', blobId);
    } else if (result.alreadyCertified?.blobId) {
      blobId = result.alreadyCertified.blobId;
      console.log('✅ EXISTING blob found:', blobId);
    } else {
      console.error('❌ Invalid Walrus response:', result);
      return NextResponse.json(
        { error: 'Invalid Walrus response format', details: result },
        { status: 500 }
      );
    }

    console.log('🔗 Aggregator URL for testing:', `https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`);

    // Başarılı response
    return NextResponse.json({
      success: true,
      blobId: blobId,
      walrusResponse: result,
    });

  } catch (error: any) {
    console.error('❌ API Route error:', error);
    
    return NextResponse.json(
      { 
        error: 'Upload failed',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// Health check için GET endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Walrus upload API is running',
    publisherUrl: process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL || 'default',
  });
}

