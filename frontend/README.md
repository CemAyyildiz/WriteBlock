# WriteBlock Frontend

WriteBlock için modern ve kullanıcı dostu web arayüzü. Sui blockchain ve Walrus storage tabanlı merkeziyetsiz içerik yönetim sistemi.

## 🎯 Özellikler

### Üç Ana Görünüm

#### 📖 Okuma Görünümü (Viewer)
- Herhangi bir kullanıcı sayfa içeriğini görüntüleyebilir
- Markdown içerik otomatik olarak HTML'e dönüştürülür
- Sayfa versiyonu ve yazar adresi görüntülenir
- Blockchain bilgileri (Walrus BLOB ID, transaction bilgileri)

#### ✍️ Yazma Görünümü (Author)
- Yetkili yazarlar için interaktif Markdown editörü
- Canlı önizleme ve tam ekran mod
- Mock Walrus BLOB ID üretimi
- Simüle edilmiş Sui transaction işlemleri
- Başarı bildirimleri ve transaction detayları

#### 👑 Yönetici Görünümü (Admin)
- Admin_Capability sahibi için yazar yönetimi
- Yeni yazar ekleme (Author_Capability verme)
- Mevcut yazarların listesi
- Simüle edilmiş yetkilendirme işlemleri

## 🚀 Kurulum

### Gereksinimler
- Node.js 18.x veya üzeri
- npm veya yarn

### Adımlar

1. Bağımlılıkları yükleyin:
```bash
npm install
# veya
yarn install
```

2. Geliştirme sunucusunu başlatın:
```bash
npm run dev
# veya
yarn dev
```

3. Tarayıcınızda açın:
```
http://localhost:3000
```

## 🏗️ Teknoloji Stack

- **Framework**: Next.js 14 (App Router)
- **Dil**: TypeScript
- **Styling**: Tailwind CSS
- **Markdown**: 
  - `react-markdown` - Markdown → HTML rendering
  - `react-simplemde-editor` - Markdown editör
  - `remark-gfm` - GitHub Flavored Markdown desteği

## 📁 Proje Yapısı

```
frontend/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Ana sayfa
│   ├── viewer/            # Okuma görünümü
│   ├── author/            # Yazma görünümü
│   ├── admin/             # Yönetici görünümü
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global stiller
├── components/            # React bileşenleri
│   └── Navbar.tsx         # Navigasyon bar
├── lib/                   # Yardımcı fonksiyonlar
│   └── mockData.ts        # Mock data ve simülasyon
├── types/                 # TypeScript tip tanımlamaları
│   └── index.ts
└── public/                # Statik dosyalar
```

## 🎨 Özellikler Detayları

### Mock Data Simülasyonu

Bu frontend, gerçek blockchain bağlantısı olmadan WriteBlock'un UI/UX akışını gösterir:

- **Mock Sui Adresleri**: Gerçek formatda test adresleri
- **Mock Walrus BLOB ID**: Otomatik üretilen sahte BLOB ID'leri
- **Simüle Transaction**: Gerçek işlem gecikmelerini taklit eden async işlemler
- **Başarı/Hata Bildirimleri**: Kullanıcı deneyimini gösteren feedback

### Markdown Editör

SimpleMDE tabanlı tam özellikli editör:
- Bold, italic, heading formatları
- Liste (sıralı/sırasız)
- Link ve resim ekleme
- Code blocks
- Canlı önizleme
- Yan yana görünüm
- Tam ekran mod

### Responsive Tasarım

- Mobile-first yaklaşım
- Tablet ve desktop optimizasyonları
- Dark mode desteği
- Erişilebilirlik odaklı

## 🔄 Gerçek Entegrasyon İçin Gereksinimler

Üretim ortamında şunlar gereklidir:

1. **Sui Wallet Entegrasyonu**
   - Sui Wallet bağlantısı (@mysten/wallet-kit)
   - Kullanıcı kimlik doğrulama
   - Transaction imzalama

2. **Walrus API Entegrasyonu**
   - Content upload/download
   - BLOB ID yönetimi
   - Storage metrikleri

3. **Smart Contract Etkileşimi**
   - Sui SDK (@mysten/sui.js)
   - Contract fonksiyon çağrıları
   - Event listening

4. **Backend API** (Opsiyonel)
   - Metadata caching
   - İndexing service
   - Analytics

## 📝 Geliştirme Notları

### Mock Data Değiştirme

`lib/mockData.ts` dosyasından mock data'yı düzenleyebilirsiniz:

```typescript
export const MOCK_PAGE: PageMetadata = {
  page_id: 0,
  walrus_blob_id: 'mock_walrus_blob_abc123xyz',
  version: 3,
  author: MOCK_ADDRESSES.author1,
  markdown_content: '# Your content here',
  // ...
};
```

### Yeni Sayfa Ekleme

1. `app/` altında yeni klasör oluşturun
2. `page.tsx` dosyası ekleyin
3. `components/Navbar.tsx` içinde navigasyon linkini ekleyin

## 🧪 Test

```bash
npm run build    # Production build test
npm run lint     # ESLint kontrolü
```

## 📦 Production Build

```bash
npm run build
npm run start
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🔗 İlgili Projeler

- [WriteBlock Smart Contract](../contract/) - Sui Move kontratı
- [Sui Blockchain](https://sui.io/)
- [Walrus Storage](https://docs.walrus.site/)

## 💡 İletişim

Sorularınız için issue açabilirsiniz.

---

**Not**: Bu bir demo uygulamasıdır. Gerçek blockchain bağlantısı yoktur. Tüm işlemler simüle edilir.

