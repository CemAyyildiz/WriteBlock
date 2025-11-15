# WriteBlock Kurulum Kılavuzu

Bu kılavuz, WriteBlock projesini yerel makinenizde çalıştırmanız için adım adım talimatlar içerir.

## 📋 Ön Gereksinimler

### Gerekli Yazılımlar

1. **Node.js** (v18.x veya üzeri)
   ```bash
   node --version  # v18.0.0 veya üzeri olmalı
   ```
   [Node.js İndir](https://nodejs.org/)

2. **Sui CLI** (Smart contract geliştirme için)
   ```bash
   sui --version
   ```
   [Sui Kurulum Kılavuzu](https://docs.sui.io/guides/developer/getting-started/sui-install)

3. **Git**
   ```bash
   git --version
   ```

## 🚀 Kurulum Adımları

### 1. Repository'yi Klonlayın

```bash
git clone <repository-url>
cd WriteBlock
```

### 2. Frontend Kurulumu

```bash
# Frontend dizinine gidin
cd frontend

# Bağımlılıkları yükleyin
npm install

# Kurulumu doğrulayın
npm run build
```

**Beklenen Çıktı**: Build işlemi hatasız tamamlanmalı.

### 3. Smart Contract Kurulumu

```bash
# Contract dizinine gidin
cd ../contract

# Contract'ı build edin
sui move build

# Testleri çalıştırın
sui move test
```

**Beklenen Çıktı**: 
```
BUILDING contract
...
Test result: OK. Total tests: 10; passed: 10; failed: 0
```

## 🎮 Uygulamayı Çalıştırma

### Frontend Geliştirme Sunucusu

```bash
cd frontend
npm run dev
```

Tarayıcınızda açın: **http://localhost:3000**

### Test Etme

Frontend üzerinden üç görünümü test edin:

1. **Ana Sayfa** (http://localhost:3000)
   - Üç görünüm kartını görmeli
   - Her kart tıklanabilir olmalı

2. **Okuma Görünümü** (http://localhost:3000/viewer)
   - Markdown içeriği rendered görünmeli
   - Alt kısımda versiyon ve yazar bilgisi olmalı
   - Blockchain bilgileri görüntülenmeli

3. **Yazma Görünümü** (http://localhost:3000/author)
   - Markdown editörü yüklenmiş olmalı
   - "Kaydet" butonu çalışmalı
   - Simüle edilmiş transaction başarı mesajı görünmeli

4. **Yönetici Görünümü** (http://localhost:3000/admin)
   - Yeni yazar ekleme formu olmalı
   - Mevcut yazarlar listesi görünmeli
   - Yazar ekleme simülasyonu çalışmalı

## 🔍 Yaygın Sorunlar ve Çözümleri

### Problem: "Cannot find module" hatası

**Çözüm**: 
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Problem: Port 3000 kullanımda

**Çözüm**:
```bash
# Farklı port kullanın
npm run dev -- -p 3001
```

### Problem: Sui CLI bulunamadı

**Çözüm**:
```bash
# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch mainnet sui
```

### Problem: TypeScript hataları

**Çözüm**:
```bash
cd frontend
npm run lint
# Hataları düzeltin veya dökümantasyona bakın
```

## 📱 Production Build

Frontend'i production için build etmek:

```bash
cd frontend
npm run build
npm run start  # Production sunucusunu başlat
```

## 🧪 Smart Contract Deploy (Testnet)

**Uyarı**: Bu adım gerçek testnet'e deploy yapar ve test SUI token gerektirir.

```bash
# 1. Sui cüzdanınızı yapılandırın
sui client

# 2. Testnet'e geçin
sui client switch --env testnet

# 3. Test SUI alın (faucet)
sui client faucet

# 4. Contract'ı deploy edin
cd contract
sui client publish --gas-budget 100000000

# 5. Deploy çıktısındaki object ID'leri kaydedin:
# - Package ID
# - CMS_Registry ID
# - Admin_Capability ID
```

Deploy sonrası bu ID'leri frontend'de kullanmak için `frontend/lib/constants.ts` oluşturun:

```typescript
export const CONTRACT_CONFIG = {
  packageId: 'YOUR_PACKAGE_ID',
  registryId: 'YOUR_REGISTRY_ID',
  network: 'testnet',
};
```

## 🔗 Gerçek Blockchain Entegrasyonu

Mock data yerine gerçek blockchain kullanmak için:

1. **Sui Wallet Kit ekleyin**:
```bash
cd frontend
npm install @mysten/wallet-kit @mysten/sui.js
```

2. **Provider ekleyin** (`app/layout.tsx`):
```typescript
import { WalletKitProvider } from '@mysten/wallet-kit';

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

3. **Hook kullanın**:
```typescript
import { useWalletKit } from '@mysten/wallet-kit';

function Component() {
  const { currentAccount, signAndExecuteTransactionBlock } = useWalletKit();
  // ...
}
```

## 📚 Daha Fazla Bilgi

- [Frontend README](./frontend/README.md) - Detaylı frontend dokümantasyonu
- [Contract Summary](./CONTRACT_SUMMARY.md) - Smart contract açıklamaları
- [Main README](./README.md) - Proje genel bakış

## 💡 İpuçları

### Geliştirme İçin

- Hot reload aktif, değişiklikler anında yansır
- Dark mode otomatik sistem tercihi ile çalışır
- Tailwind CSS class'ları mevcut
- TypeScript tip kontrolü aktif

### Performans

- Next.js'in Image optimization'ını kullanın
- Dynamic import ile code splitting yapın
- Markdown render'ı memoize edin

### Güvenlik

- Environment variables için `.env.local` kullanın
- API keys'i commit etmeyin
- Production'da HTTPS kullanın

## 🆘 Yardım

Sorun yaşıyorsanız:

1. GitHub Issues'a bakın
2. Yeni issue açın
3. Discord/Telegram topluluğuna katılın
4. Dokümantasyonu kontrol edin

## ✅ Kurulum Kontrolü

Tüm adımları tamamladıysanız:

- [ ] Node.js kurulu
- [ ] Sui CLI kurulu (opsiyonel)
- [ ] Frontend çalışıyor (localhost:3000)
- [ ] Contract build başarılı
- [ ] Contract testleri geçiyor
- [ ] Tüm üç görünüm erişilebilir
- [ ] Demo simülasyonları çalışıyor

Tebrikler! 🎉 WriteBlock'u başarıyla kurdunuz.

