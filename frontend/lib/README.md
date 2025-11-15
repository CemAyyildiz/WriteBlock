# WriteBlock Library Architecture

Bu klasör WriteBlock'un abstraction layer mimarisini içerir.

## 📂 Klasör Yapısı

```
lib/
├── interfaces/              # Sözleşmeler (Contracts)
│   ├── storage.interface.ts      # Storage operasyonları
│   ├── blockchain.interface.ts   # Blockchain operasyonları
│   └── wallet.interface.ts       # Wallet operasyonları
│
├── mock/                    # Mock Implementations (Development)
│   ├── mockStorage.ts           # Fake Walrus storage
│   ├── mockBlockchain.ts        # Fake Sui blockchain
│   └── mockWallet.ts            # Fake Sui wallet
│
├── walrus/                  # Walrus Implementations (Production)
│   └── walrusStorage.ts         # Real Walrus API integration
│
├── sui/                     # Sui Implementations (Production)
│   ├── suiBlockchain.ts         # Real Sui smart contract calls
│   └── suiWallet.ts             # Real Sui wallet integration
│
├── client.ts                # Factory Pattern - Provider seçimi
├── mockData.ts              # Test data (backward compatibility)
└── README.md                # Bu dosya
```

## 🎯 Kullanım

### UI Component'larında

```typescript
import { getStorageClient, getBlockchainClient } from '@/lib/client';

// Storage operations
const storageClient = getStorageClient();
const blobId = await storageClient.upload(content);
const content = await storageClient.download(blobId);

// Blockchain operations
const blockchainClient = getBlockchainClient();
const txResult = await blockchainClient.updatePageContent(
  authorCapId,
  pageId,
  newBlobId
);
```

### Environment Configuration

```bash
# .env.local
NEXT_PUBLIC_STORAGE_PROVIDER=mock      # 'mock' | 'walrus'
NEXT_PUBLIC_BLOCKCHAIN_PROVIDER=mock   # 'mock' | 'sui'
NEXT_PUBLIC_WALLET_PROVIDER=mock       # 'mock' | 'sui'
```

## 🔀 Provider Geçişi

### Development (Şu an)
```bash
NEXT_PUBLIC_STORAGE_PROVIDER=mock
NEXT_PUBLIC_BLOCKCHAIN_PROVIDER=mock
NEXT_PUBLIC_WALLET_PROVIDER=mock
```
✅ Tüm özellikler çalışır (simüle edilmiş)

### Partial Integration
```bash
NEXT_PUBLIC_STORAGE_PROVIDER=walrus    # Gerçek Walrus
NEXT_PUBLIC_BLOCKCHAIN_PROVIDER=mock   # Hala mock
NEXT_PUBLIC_WALLET_PROVIDER=mock
```
✅ Sadece Walrus gerçek, geri kalanı mock

### Full Production
```bash
NEXT_PUBLIC_STORAGE_PROVIDER=walrus
NEXT_PUBLIC_BLOCKCHAIN_PROVIDER=sui
NEXT_PUBLIC_WALLET_PROVIDER=sui
```
✅ Tüm sistem gerçek blockchain üzerinde

## 📝 Yeni Implementation Ekleme

### 1. Interface'i Implement Et

```typescript
// lib/walrus/walrusStorage.ts
import { IStorageClient } from '../interfaces/storage.interface';

export class WalrusStorageClient implements IStorageClient {
  async upload(content: string | Blob): Promise<string> {
    // Walrus API call
  }
  
  async download(blobId: string): Promise<string> {
    // Walrus API call
  }
  
  // ... diğer metodlar
}
```

### 2. Client Factory'ye Ekle

```typescript
// lib/client.ts
case 'walrus':
  storageClient = new WalrusStorageClient();
  break;
```

### 3. Environment Variable Ekle

```bash
# .env.local
NEXT_PUBLIC_STORAGE_PROVIDER=walrus
NEXT_PUBLIC_WALRUS_API_URL=https://...
```

## ✨ Avantajlar

### 🎭 Mock Development
- Gerçek API'lere ihtiyaç yok
- Hızlı test ve iterasyon
- Offline çalışabilme
- Tahmin edilebilir sonuçlar

### 🔄 Easy Migration
- UI kodu değişmez
- Sadece config değişir
- Gradual rollout mümkün
- Rollback kolay

### 🧪 Testability
- Mock'larla unit test
- Integration test'ler kolay
- CI/CD friendly
- Test isolation

### 🚀 Production Ready
- Type-safe
- Error handling
- Consistent API
- Professional architecture

## 📚 Detaylı Dokümantasyon

- **[ABSTRACTION_GUIDE.md](../ABSTRACTION_GUIDE.md)** - Kapsamlı entegrasyon kılavuzu
- **[ENV_CONFIG.md](../ENV_CONFIG.md)** - Environment konfigürasyonu
- **Interface dosyaları** - Her interface JSDoc ile dokümante edilmiş

## 🔍 Örnek: Kaydetme İşlemi

### Eski Yöntem (Doğrudan Mock)
```typescript
// ❌ Implementation'a bağlı
const blobId = generateMockWalrusBlobId();
const txResult = await simulateSuiTransaction('update');
```

### Yeni Yöntem (Abstraction)
```typescript
// ✅ Interface'e bağlı
const storageClient = getStorageClient();    // Mock veya Walrus
const blobId = await storageClient.upload(content);

const blockchainClient = getBlockchainClient();  // Mock veya Sui
const txResult = await blockchainClient.updatePageContent(...);
```

**Sonuç**: Aynı kod hem mock hem real ile çalışır! 🎉

## 🎓 Best Practices

1. **Her zaman interface kullan** - Implementation'lara doğrudan erişme
2. **Factory fonksiyonları kullan** - Singleton pattern
3. **Environment'ta yapılandır** - Kod değişikliği yapmadan
4. **Error handling ekle** - Try-catch blokları
5. **Console log kullan** - Hangi provider kullanıldığını göster

## 💡 Tips

- Mock'lar gerçek API'yi taklit eder (delay, error simulation)
- Her interface metodu documented (JSDoc)
- TypeScript ile tam type safety
- Environment variables Next.js tarafından compile-time inject edilir

---

**Sorularınız için**: [ABSTRACTION_GUIDE.md](../ABSTRACTION_GUIDE.md)

