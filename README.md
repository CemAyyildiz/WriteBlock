# WriteBlock 📝

Sui blockchain ve Walrus dağıtık depolama sistemi üzerine kurulu merkeziyetsiz içerik yönetim sistemi (Decentralized CMS).

## 🌟 Özellikler

### ⛓️ Blockchain Tabanlı
- Sui blockchain üzerinde metadata yönetimi
- Capability pattern ile güvenli yetki kontrolü
- Değiştirilemez versiyon geçmişi

### 🐋 Dağıtık Depolama
- Walrus storage ile kalıcı içerik saklama
- BLOB tabanlı içerik adresleme
- Sansüre dirençli altyapı

### 👥 Rol Tabanlı Erişim
- **Admin**: Yazar yetkilendirme ve sistem yönetimi
- **Author**: İçerik oluşturma ve güncelleme
- **Viewer**: Herkese açık içerik görüntüleme

## 📁 Proje Yapısı

```
WriteBlock/
├── contract/              # Sui Move smart contract
│   ├── sources/
│   │   └── contract.move # Ana kontrat dosyası
│   ├── tests/            # Test suite
│   └── Move.toml         # Move konfigürasyonu
│
├── frontend/             # Next.js web uygulaması
│   ├── app/              # Next.js App Router
│   │   ├── viewer/       # Okuma görünümü
│   │   ├── author/       # Yazma görünümü
│   │   └── admin/        # Yönetici görünümü
│   ├── components/       # React bileşenleri
│   ├── lib/              # Utility fonksiyonlar
│   └── types/            # TypeScript types
│
└── CONTRACT_SUMMARY.md   # Kontrat dokümantasyonu
```

## 🚀 Hızlı Başlangıç

### Smart Contract

```bash
cd contract

# Build
sui move build

# Test
sui move test

# Deploy (Sui testnet/mainnet)
sui client publish --gas-budget 100000000
```

### Frontend

```bash
cd frontend

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Tarayıcıda aç: http://localhost:3000
```

## 🏗️ Mimari

```
┌─────────────────────────────────────────────┐
│          Frontend (Next.js)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Viewer  │ │  Author  │ │  Admin   │   │
│  └──────────┘ └──────────┘ └──────────┘   │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│       Sui Blockchain (Smart Contract)       │
│  ┌──────────────┐  ┌─────────────────────┐ │
│  │ CMS_Registry │  │  Page_Metadata      │ │
│  ├──────────────┤  ├─────────────────────┤ │
│  │ Admin_Cap    │  │  - page_id          │ │
│  │ Author_Cap   │  │  - walrus_blob_id   │ │
│  └──────────────┘  │  - version          │ │
│                    │  - author           │ │
│                    └─────────────────────┘ │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│       Walrus Storage (Content BLOBs)        │
│         Distributed & Permanent             │
└─────────────────────────────────────────────┘
```

## 🔑 Temel Kavramlar

### Capability Pattern

WriteBlock, Sui'nin capability pattern'ini kullanarak yetki yönetimini sağlar:

- **Admin_Capability**: Sistem yöneticisi yetkisi
  - Yeni yazar ekleme
  - Sayfa oluşturma
  
- **Author_Capability**: İçerik yazarı yetkisi
  - Sayfa oluşturma
  - İçerik güncelleme

Bu capability'ler:
- ✅ Kopyalanamaz (non-copyable)
- ✅ Yok edilemez (non-droppable)
- ✅ Transfer edilebilir
- ✅ Adres tabanlı kontrol gerektirmez

### Versiyon Kontrolü

Her içerik güncellemesi:
1. Yeni içerik Walrus'a yüklenir → Yeni BLOB ID
2. Page_Metadata güncellenir
3. Version numarası otomatik artırılır
4. Update timestamp güncellenir

### İçerik Akışı

**Okuma (Viewer)**:
```
Page_Metadata.walrus_blob_id → Walrus → Content → HTML
```

**Yazma (Author)**:
```
Markdown Content → Walrus → BLOB ID → Sui TX → Page_Metadata Updated
```

## 📚 Dokümantasyon

- [Smart Contract Detayları](./CONTRACT_SUMMARY.md)
- [Frontend Kullanım Kılavuzu](./frontend/README.md)
- [Sui Move Dokümantasyonu](https://docs.sui.io/build/move)
- [Walrus Dokümantasyonu](https://docs.walrus.site/)

## 🧪 Test Edilmiş Senaryolar

### Smart Contract Tests ✅
- Admin capability grant
- Author capability grant (multiple)
- Page creation
- Page content update
- Version incrementation
- Multiple pages
- View functions
- Full workflow integration

### Frontend Tests (Manual)
- ✅ Viewer: Markdown rendering
- ✅ Author: Editör ve kaydetme simülasyonu
- ✅ Admin: Yazar ekleme simülasyonu
- ✅ Responsive design
- ✅ Dark mode

## 🎨 Demo Özellikleri

Mevcut frontend **demo/mockup** amaçlıdır ve şunları içerir:

- ✅ Mock Sui adresleri
- ✅ Mock Walrus BLOB ID üretimi
- ✅ Simüle edilmiş blockchain işlemleri
- ✅ Tam UI/UX akışı
- ❌ Gerçek Sui wallet bağlantısı yok
- ❌ Gerçek Walrus upload/download yok

## 🚧 Üretim İçin Gereksinimler

Frontend'i gerçek blockchain üzerinde çalıştırmak için:

1. **Sui Wallet Entegrasyonu**
   ```typescript
   import { WalletKitProvider } from '@mysten/wallet-kit';
   ```

2. **Sui SDK Kullanımı**
   ```typescript
   import { SuiClient } from '@mysten/sui.js/client';
   import { TransactionBlock } from '@mysten/sui.js/transactions';
   ```

3. **Walrus API Entegrasyonu**
   - Upload endpoint
   - Download endpoint
   - BLOB ID validation

4. **Contract Deploy & Adresleri**
   - Package ID
   - CMS_Registry object ID
   - Admin capability transfer

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'feat: Yeni özellik eklendi'`)
4. Branch'i push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

## 📝 Commit Kuralları

- `feat:` - Yeni özellik
- `fix:` - Bug fix
- `docs:` - Dokümantasyon
- `style:` - Formatting
- `refactor:` - Code refactoring
- `test:` - Test ekleme/düzeltme
- `chore:` - Bakım işleri

## 🔐 Güvenlik

Güvenlik açıkları için lütfen issue açmak yerine doğrudan iletişime geçin.

## 📄 Lisans

MIT License - detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🙏 Teşekkürler

- [Sui Foundation](https://sui.io/) - Blockchain altyapısı
- [Walrus](https://docs.walrus.site/) - Dağıtık depolama
- [Next.js](https://nextjs.org/) - Frontend framework

## 📞 İletişim

Sorularınız için issue açabilirsiniz.

---

**⚠️ Not**: Bu proje demo/eğitim amaçlıdır. Üretim ortamında kullanmadan önce kapsamlı testler yapılmalı ve güvenlik denetiminden geçirilmelidir.

