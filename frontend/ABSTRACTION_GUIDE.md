# Abstraction Layer Guide

Bu kılavuz, WriteBlock'un abstraction layer mimarisini ve gerçek Walrus/Sui entegrasyonunun nasıl yapılacağını açıklar.

## 📐 Mimari Genel Bakış

```
┌─────────────────────────────────────────────┐
│           UI Components (React)             │
│         (Author, Admin, Viewer)             │
└──────────────────┬──────────────────────────┘
                   │
                   │ Interface'leri kullanır
                   │
┌──────────────────▼──────────────────────────┐
│          Client Factory (lib/client.ts)     │
│     Environment'a göre implementation seçer  │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐   ┌────────▼──────────┐
│  Mock Clients  │   │  Real Clients     │
│  (Development) │   │  (Production)     │
│                │   │                   │
│ - mockStorage  │   │ - walrusStorage   │
│ - mockBlockchain│  │ - suiBlockchain   │
│ - mockWallet   │   │ - suiWallet       │
└────────────────┘   └───────────────────┘
```

## 🎯 Temel Prensipler

### 1. **Separation of Concerns**
- UI components interface'leri kullanır
- Implementation detayları gizlidir
- Mock/Real arası geçiş sadece config ile

### 2. **Interface-First Design**
```typescript
// ✅ İYİ: Interface'e bağlı
const storageClient = getStorageClient();
const blobId = await storageClient.upload(content);

// ❌ KÖTÜ: Implementation'a bağlı
const blobId = await walrusUpload(content);
```

### 3. **Environment-Based Configuration**
```bash
# .env.local
NEXT_PUBLIC_STORAGE_PROVIDER=mock      # veya 'walrus'
NEXT_PUBLIC_BLOCKCHAIN_PROVIDER=mock   # veya 'sui'
NEXT_PUBLIC_WALLET_PROVIDER=mock       # veya 'sui'
```

## 📁 Dosya Yapısı

```
lib/
├── interfaces/              # Interface tanımları (DEĞİŞMEZ)
│   ├── storage.interface.ts
│   ├── blockchain.interface.ts
│   └── wallet.interface.ts
│
├── mock/                    # Mock implementations (DEV)
│   ├── mockStorage.ts       ✅ TAMAMLANDI
│   ├── mockBlockchain.ts    ✅ TAMAMLANDI
│   └── mockWallet.ts        ✅ TAMAMLANDI
│
├── walrus/                  # Walrus implementation (PROD)
│   └── walrusStorage.ts     ⚠️  TODO
│
├── sui/                     # Sui implementation (PROD)
│   ├── suiBlockchain.ts     ⚠️  TODO
│   └── suiWallet.ts         ⚠️  TODO
│
└── client.ts               # Factory (DEĞİŞMEZ)
```

## 🚀 Gerçek Entegrasyon Yapımı

### Adım 1: Walrus Storage Entegrasyonu

**Dosya**: `lib/walrus/walrusStorage.ts`

```typescript
import { IStorageClient, BlobMetadata } from '../interfaces/storage.interface';

export class WalrusStorageClient implements IStorageClient {
  private apiUrl: string;

  constructor(apiUrl?: string) {
    this.apiUrl = apiUrl || process.env.NEXT_PUBLIC_WALRUS_API_URL || '';
  }

  async upload(content: string | Blob): Promise<string> {
    // 1. Prepare content
    const blob = content instanceof Blob 
      ? content 
      : new Blob([content], { type: 'text/markdown' });

    // 2. Create FormData
    const formData = new FormData();
    formData.append('file', blob);

    // 3. Upload to Walrus
    const response = await fetch(`${this.apiUrl}/v1/store`, {
      method: 'PUT',
      body: formData,
      headers: {
        // Add authentication if needed
      },
    });

    if (!response.ok) {
      throw new Error(`Walrus upload failed: ${response.statusText}`);
    }

    // 4. Parse response
    const data = await response.json();
    return data.newlyCreated?.blobObject?.blobId || data.alreadyCertified?.blobId;
  }

  async download(blobId: string): Promise<string> {
    // 1. Get aggregator URL from env
    const aggregatorUrl = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL;
    
    // 2. Fetch from Walrus
    const response = await fetch(`${aggregatorUrl}/v1/${blobId}`);
    
    if (!response.ok) {
      throw new Error(`Walrus download failed: ${response.statusText}`);
    }

    // 3. Return content
    return await response.text();
  }

  async exists(blobId: string): Promise<boolean> {
    try {
      const aggregatorUrl = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL;
      const response = await fetch(`${aggregatorUrl}/v1/${blobId}`, {
        method: 'HEAD',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getMetadata(blobId: string): Promise<BlobMetadata> {
    // Walrus doesn't provide direct metadata endpoint
    // You might need to track this separately or implement custom logic
    throw new Error('Metadata not available from Walrus');
  }
}
```

**Test**:
```typescript
// Test Walrus storage locally
import { WalrusStorageClient } from './lib/walrus/walrusStorage';

const client = new WalrusStorageClient();
const blobId = await client.upload('# Test Content');
console.log('Uploaded:', blobId);

const content = await client.download(blobId);
console.log('Downloaded:', content);
```

---

### Adım 2: Sui Blockchain Entegrasyonu

**Gerekli Paketler**:
```bash
npm install @mysten/sui.js
```

**Dosya**: `lib/sui/suiBlockchain.ts`

```typescript
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import {
  IBlockchainClient,
  TransactionResult,
  PageMetadata,
} from '../interfaces/blockchain.interface';

export class SuiBlockchainClient implements IBlockchainClient {
  private client: SuiClient;
  private packageId: string;

  constructor() {
    const network = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';
    this.client = new SuiClient({ url: this.getNodeUrl(network) });
    this.packageId = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
  }

  async updatePageContent(
    authorCapId: string,
    pageId: string,
    newWalrusBlobId: string
  ): Promise<TransactionResult> {
    try {
      // 1. Create transaction block
      const txb = new TransactionBlock();
      
      // 2. Call update_page_content function
      txb.moveCall({
        target: `${this.packageId}::contract::update_page_content`,
        arguments: [
          txb.object(authorCapId),      // author_cap reference
          txb.object(pageId),            // page reference
          txb.pure(newWalrusBlobId),     // new BLOB ID
        ],
      });

      // 3. Sign and execute (wallet will handle this)
      // This requires wallet integration - see next step
      
      return {
        success: true,
        txHash: 'PENDING_WALLET_SIGNATURE',
      };
    } catch (error) {
      return {
        success: false,
        txHash: '',
        error: (error as Error).message,
      };
    }
  }

  async grantAuthorCapability(
    adminCapId: string,
    recipientAddress: string
  ): Promise<TransactionResult> {
    const txb = new TransactionBlock();
    
    txb.moveCall({
      target: `${this.packageId}::contract::grant_author_capability`,
      arguments: [
        txb.object(adminCapId),
        txb.pure(recipientAddress),
      ],
    });

    return {
      success: true,
      txHash: 'PENDING_WALLET_SIGNATURE',
    };
  }

  async getPageMetadata(pageId: string): Promise<PageMetadata> {
    // 1. Get object from Sui
    const object = await this.client.getObject({
      id: pageId,
      options: { showContent: true },
    });

    // 2. Parse content
    const fields = (object.data?.content as any)?.fields;
    
    return {
      pageId: Number(fields.page_id),
      walrusBlobId: fields.walrus_blob_id,
      version: Number(fields.version),
      author: fields.author,
      createdAt: Number(fields.created_at),
      updatedAt: Number(fields.updated_at),
    };
  }

  private getNodeUrl(network: string): string {
    const urls: Record<string, string> = {
      mainnet: 'https://fullnode.mainnet.sui.io:443',
      testnet: 'https://fullnode.testnet.sui.io:443',
      devnet: 'https://fullnode.devnet.sui.io:443',
    };
    return urls[network] || urls.testnet;
  }
}
```

---

### Adım 3: Sui Wallet Entegrasyonu

**Gerekli Paketler**:
```bash
npm install @mysten/wallet-kit
```

**Dosya**: `app/layout.tsx` (Provider ekle)

```typescript
'use client';

import { WalletKitProvider } from '@mysten/wallet-kit';
import '@mysten/wallet-kit/style.css';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WalletKitProvider>
          {children}
        </WalletKitProvider>
      </body>
    </html>
  );
}
```

**Dosya**: `lib/sui/suiWallet.ts`

```typescript
import { useWalletKit } from '@mysten/wallet-kit';
import {
  IWalletClient,
  UserCapabilities,
  TransactionResult,
} from '../interfaces/wallet.interface';

export class SuiWalletClient implements IWalletClient {
  // Note: In React components, use hooks directly
  // This class is for non-React contexts

  async connect(): Promise<string> {
    // This will be handled by useWalletKit hook in components
    throw new Error('Use useWalletKit hook in React components');
  }

  async getCurrentAddress(): Promise<string | null> {
    // Use hook: const { currentAccount } = useWalletKit();
    throw new Error('Use useWalletKit hook in React components');
  }

  async signAndExecuteTransaction(transaction: any): Promise<TransactionResult> {
    // Use hook: const { signAndExecuteTransactionBlock } = useWalletKit();
    throw new Error('Use useWalletKit hook in React components');
  }

  // ... other methods
}
```

**Component kullanımı**:
```typescript
'use client';

import { useWalletKit } from '@mysten/wallet-kit';
import { getBlockchainClient } from '@/lib/client';

export function AuthorPage() {
  const { 
    currentAccount, 
    signAndExecuteTransactionBlock 
  } = useWalletKit();

  const handleSave = async () => {
    // 1. Create transaction
    const blockchainClient = getBlockchainClient();
    const txb = await blockchainClient.createUpdateTransaction(...);

    // 2. Sign with wallet
    const result = await signAndExecuteTransactionBlock({
      transactionBlock: txb,
    });

    console.log('TX Hash:', result.digest);
  };
}
```

---

## 🔄 Mock'tan Real'e Geçiş

### Development (Mock)
```bash
# .env.local
NEXT_PUBLIC_STORAGE_PROVIDER=mock
NEXT_PUBLIC_BLOCKCHAIN_PROVIDER=mock
NEXT_PUBLIC_WALLET_PROVIDER=mock
```

### Testing (Mixed)
```bash
# .env.local
NEXT_PUBLIC_STORAGE_PROVIDER=walrus  # Gerçek Walrus
NEXT_PUBLIC_BLOCKCHAIN_PROVIDER=mock # Mock Sui (test için)
NEXT_PUBLIC_WALLET_PROVIDER=mock
```

### Production (Real)
```bash
# .env.local
NEXT_PUBLIC_STORAGE_PROVIDER=walrus
NEXT_PUBLIC_BLOCKCHAIN_PROVIDER=sui
NEXT_PUBLIC_WALLET_PROVIDER=sui

# Walrus configuration
NEXT_PUBLIC_WALRUS_API_URL=https://publisher.walrus-testnet.walrus.space
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space

# Sui configuration
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=0xYOUR_DEPLOYED_PACKAGE_ID
NEXT_PUBLIC_REGISTRY_ID=0xYOUR_REGISTRY_OBJECT_ID
```

---

## ✅ Checklist: Gerçek Entegrasyon

### Walrus Storage
- [ ] `WalrusStorageClient.upload()` implementasyonu
- [ ] `WalrusStorageClient.download()` implementasyonu
- [ ] Walrus API credentials konfigürasyonu
- [ ] Error handling ve retry logic
- [ ] Unit testler

### Sui Blockchain
- [ ] Smart contract deploy (testnet)
- [ ] Package ID ve object ID'leri kaydet
- [ ] `SuiBlockchainClient` tüm fonksiyonları implement et
- [ ] Transaction building ve parsing
- [ ] Event listening (opsiyonel)
- [ ] Integration testler

### Sui Wallet
- [ ] `@mysten/wallet-kit` package kurulumu
- [ ] Provider setup (`app/layout.tsx`)
- [ ] Component'larda hook kullanımı
- [ ] Connect/disconnect UI
- [ ] Transaction signing flow
- [ ] User capabilities query

### Testing
- [ ] Mock environment tamamen çalışıyor
- [ ] Walrus upload/download test edildi
- [ ] Sui transactions test edildi
- [ ] Wallet connect/disconnect test edildi
- [ ] End-to-end flow test edildi

---

## 🎯 Önemli Notlar

1. **UI Hiç Değişmeyecek**: Sadece implementation dosyaları değişir
2. **Paralel Geliştirme**: Walrus ve Sui entegrasyonları bağımsız yapılabilir
3. **Gradual Migration**: Önce Walrus, sonra Sui, sonra Wallet
4. **Always Testable**: Mock ile test ortamı her zaman hazır

---

## 📞 Yardım

Entegrasyon sırasında sorun yaşarsanız:

1. Mock implementation'a bakın (referans olarak)
2. Interface'lerin JSDoc'larını okuyun
3. Console log'ları kontrol edin
4. GitHub Issues'da soru sorun

Good luck! 🚀

