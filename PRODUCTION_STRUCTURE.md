# WriteBlock Production Yapısı

✅ **TAMAMLANDI** - Production'a uygun CMS yapısı oluşturuldu!

## 🎯 Yeni Yapı Özeti

### URL Yapısı

```
siteminadı.com/                           → Dashboard (tüm yazılar)
siteminadı.com/writeblock-decentralized-cms → Dinamik yazı okuma
siteminadı.com/getting-started-sui       → Dinamik yazı okuma
siteminadı.com/author                    → Yazar paneli (yeni yazı)
siteminadı.com/admin                     → Admin paneli
```

## 📱 Sayfalar

### 1. Ana Sayfa (Dashboard) - `/`

**Amaç**: Tüm yayınlanmış yazıların listesi

**Özellikler**:
- ✅ Tüm yazıları card olarak listeler
- ✅ Başlık, özet, yazar, tarih, versiyon gösterir
- ✅ Her card tıklanabilir (slug'a yönlendirir)
- ✅ İstatistik kartları (blockchain, storage, yazar sayısı)
- ✅ Responsive grid layout
- ✅ Navbar her zaman görünür

**UI Elemanları**:
- Header: "📚 Tüm Yazılar" + toplam sayı
- Stats: 3 kart (Blockchain, Storage, Yazarlar)
- Post Cards: Hover efekti, okuma linki
- Footer: Admin ve Yazar panel linkleri

---

### 2. Dinamik Yazı Sayfası - `/[slug]`

**Amaç**: Tekil yazıyı göster

**Özellikler**:
- ✅ URL slug'ından yazıyı çeker (`siteminadı.com/yazı-adı`)
- ✅ Markdown → HTML render
- ✅ Başlık, yazar, tarih, versiyon metadata
- ✅ "← Tüm Yazılar" geri butonu (üstte ve altta)
- ✅ Blockchain bilgileri kartı
- ✅ 404 durumu (yazı bulunamazsa)
- ✅ Loading state

**URL Örnekleri**:
```
/writeblock-decentralized-cms
/getting-started-sui-blockchain
/understanding-walrus-storage
```

**Not**: Gerçek production'da slug'lar unique olmalı ve veritabanında kontrol edilmeli.

---

### 3. Yazar Paneli - `/author`

**Amaç**: Yeni yazı oluşturma

**Özellikler**:
- ✅ Başlık, slug, özet meta alanları
- ✅ Auto slug generation (Türkçe karakter desteği)
- ✅ SimpleMDE Markdown editörü
- ✅ Real-time karakter sayacı
- ✅ Walrus + Sui entegrasyonu (abstraction layer)
- ✅ Başarı mesajı + transaction bilgileri
- ✅ "Yazıyı Görüntüle" linki
- ✅ Sidebar: Yazılarım listesi (son 5)
- ✅ Yetki kontrolü (Author_Capability)

**Akış**:
1. Yazar başlık, slug, içerik girer
2. "Yayınla" butonuna tıklar
3. İçerik Walrus'a upload edilir
4. BLOB ID blockchain'e kaydedilir
5. Başarı mesajı + yazı linki gösterilir
6. Kullanıcı yazıyı görüntüleyebilir

**Gelecek İyileştirmeler**:
- [ ] Mevcut yazıyı düzenleme (`/author/edit/[id]`)
- [ ] Taslak kaydetme
- [ ] Resim upload
- [ ] Önizleme modu

---

### 4. Admin Paneli - `/admin`

**Amaç**: Yazar yetkilendirme

**Özellikler**:
- ✅ Yeni yazar ekleme formu
- ✅ Sui adres validasyonu
- ✅ Mevcut yazarlar listesi
- ✅ Author_Capability mint simülasyonu
- ✅ Transaction bilgileri
- ✅ Real-time liste güncelleme

**Akış**:
1. Admin yazar ismini ve Sui adresini girer
2. "Yazar Yetkisi Ver" butonuna tıklar
3. Blockchain'de Author_Capability mint edilir
4. Capability belirtilen adrese transfer edilir
5. Yazar listesine eklenir

---

## 🧭 Navigasyon (Navbar)

**Her sayfada görünür** (sticky top)

**Menü Öğeleri**:
```
[W] WriteBlock | 📚 Yazılar | ✍️ Yaz | 👑 Admin
```

- **Yazılar** → Dashboard (/)
- **Yaz** → Yazar Paneli (/author)
- **Admin** → Admin Paneli (/admin)

**Aktif sayfa**: Mavi arka plan, kalın yazı

---

## 📊 Mock Data

### Örnek Yazılar (3 adet)

```typescript
1. "WriteBlock: Decentralized Content Management"
   Slug: writeblock-decentralized-cms
   Author: Alice (0xabcd...)
   Version: 3

2. "Getting Started with Sui Blockchain"
   Slug: getting-started-sui-blockchain
   Author: Bob (0x9876...)
   Version: 1

3. "Understanding Walrus Storage"
   Slug: understanding-walrus-storage
   Author: Alice (0xabcd...)
   Version: 2
```

### Örnek Yazarlar (2 adet)

```typescript
1. Alice Writer (0xabcdef...)
   Granted: Nov 10, 2024

2. Bob Editor (0x987654...)
   Granted: Jan 1, 2025
```

---

## 🔄 Kullanıcı Akışları

### Okuyucu Akışı (Herkes)

1. **siteminadı.com** → Dashboard açılır
2. Yazı kartlarına göz atar
3. İlgisini çeken yazıya tıklar
4. **siteminadı.com/yazı-adı** → Yazı açılır
5. Okur
6. "Tüm Yazılara Dön" ile dashboard'a döner

### Yazar Akışı (Yetkilendirildikten sonra)

1. **siteminadı.com/author** → Yazar paneline gider
2. Başlık, slug, içerik yazar
3. "Yayınla" butonuna tıklar
4. Başarı mesajı alır
5. "Yazıyı Görüntüle" ile yayınlanan yazıyı görür
6. Dashboard'da yazısının listelendiğini görür

### Admin Akışı (Admin_Capability sahibi)

1. **siteminadı.com/admin** → Admin paneline gider
2. Yeni yazarın bilgilerini girer
3. "Yazar Yetkisi Ver" butonuna tıklar
4. Blockchain'de capability mint edilir
5. Yazar listeye eklenir
6. Yeni yazar artık /author sayfasından yazı yayınlayabilir

---

## 🎨 UI/UX Özellikleri

### Renk Şeması

```
Primary: #0ea5e9 (Sui blue)
Success: #10b981 (Green)
Warning: #f59e0b (Amber)
Error: #ef4444 (Red)

Background:
- Light: gradient-to-br from-gray-50 via-white to-blue-50
- Dark: gradient-to-br from-gray-900 via-gray-800 to-gray-900
```

### Animasyonlar

- Card hover: scale + shadow + border color
- Button hover: color transition
- Success message: fade-in + slide-in-from-top
- Loading: spinner rotation
- Page transitions: smooth

### Responsive

**Breakpoints**:
- Mobile: < 768px (single column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (3 columns)

**Mobile Optimizations**:
- Navbar compact
- Single column layout
- Touch-friendly buttons
- Reduced paddings

---

## 🔐 Yetkilendirme Sistemi

### Roller

```
1. Viewer (Herkes)
   - Dashboard görüntüleme ✓
   - Yazı okuma ✓
   - Yorum yapma ✗ (henüz yok)

2. Author (Author_Capability sahibi)
   - Viewer tüm hakları +
   - Yeni yazı oluşturma ✓
   - Kendi yazılarını düzenleme ✓
   - Yazı silme ✗ (henüz yok)

3. Admin (Admin_Capability sahibi)
   - Author tüm hakları +
   - Yazar ekleme ✓
   - Yazar kaldırma ✗ (henüz yok)
   - Sistem ayarları ✗ (henüz yok)
```

### Kontrol Mekanizması

**Frontend (Geçici - Mock)**:
```typescript
const session = getUserSession('author');
if (!session.hasAuthorCap) {
  // Yetki hatası göster
}
```

**Production (Gerçek)**:
```typescript
const capabilities = await walletClient.getUserCapabilities(address);
if (!capabilities.hasAuthorCap) {
  // Wallet'tan Author_Capability object ID iste
}
```

---

## 🚀 Production Geçiş Gereksinimleri

### 1. Wallet Entegrasyonu

```typescript
// Connect buton ekle
<WalletKitProvider>
  <ConnectButton />
</WalletKitProvider>

// Her sayfada
const { currentAccount } = useWalletKit();
if (!currentAccount) {
  // "Cüzdan Bağla" mesajı göster
}
```

### 2. Gerçek CRUD Operasyonları

**Create (Yeni Yazı)**:
```typescript
// 1. Walrus upload
const blobId = await walrusClient.upload(markdown);

// 2. Sui transaction
const tx = await blockchainClient.createPage(authorCapId, registryId, blobId);

// 3. Metadata kaydet (opsiyonel cache)
await cacheService.savePageMetadata({ title, slug, blobId, ...});
```

**Read (Yazı Getir)**:
```typescript
// 1. Blockchain'den page object al
const pageObject = await suiClient.getObject(pageId);

// 2. BLOB ID'yi parse et
const blobId = pageObject.fields.walrus_blob_id;

// 3. Walrus'tan içeriği indir
const markdown = await walrusClient.download(blobId);
```

**Update (Yazı Güncelle)**:
```typescript
// 1. Yeni içeriği Walrus'a yükle
const newBlobId = await walrusClient.upload(updatedMarkdown);

// 2. Sui transaction
await blockchainClient.updatePageContent(authorCapId, pageId, newBlobId);
```

### 3. Slug → Page ID Mapping

**Problem**: URL'de slug var, blockchain'de page_id

**Çözümler**:

**A) On-chain mapping** (Gas expensive):
```move
public struct SlugRegistry has key {
    slugs: Table<String, u64>, // slug -> page_id
}
```

**B) Indexer service** (Önerilen):
```typescript
// Backend API veya The Graph style indexer
GET /api/page?slug=my-article
→ { page_id: 5, object_id: "0x...", ... }
```

**C) Client-side cache** (Basit):
```typescript
// localStorage veya state management
const pages = await getAllPagesFromBlockchain();
const mapping = pages.reduce((acc, p) => {
  acc[p.slug] = p.page_id;
  return acc;
}, {});
```

---

## 📝 Eksik Özellikler (Roadmap)

### Kısa Vadeli (1-2 hafta)

- [ ] Yazı düzenleme (`/author/edit/[id]`)
- [ ] Yazı silme (admin veya yazar)
- [ ] Taslak kaydetme (localStorage)
- [ ] Arama fonksiyonu
- [ ] Kategori/tag sistemi

### Orta Vadeli (1 ay)

- [ ] Resim upload ve yönetimi
- [ ] SEO metadata (title, description, og:image)
- [ ] RSS feed
- [ ] Sitemap
- [ ] Analytics

### Uzun Vadeli (2+ ay)

- [ ] Yorum sistemi (on-chain)
- [ ] Beğeni/reaction sistemi
- [ ] Çoklu yazar desteği (co-authoring)
- [ ] Version history görüntüleme
- [ ] Diff viewer

---

## 🧪 Test Senaryoları

### Dashboard Test

1. ✅ Ana sayfayı aç
2. ✅ 3 yazı kartı görünüyor mu?
3. ✅ İstatistikler doğru mu?
4. ✅ Karta tıkla → slug sayfasına git

### Yazı Okuma Test

1. ✅ `/writeblock-decentralized-cms` aç
2. ✅ Markdown render oluyor mu?
3. ✅ Metadata doğru mu?
4. ✅ "Tüm Yazılara Dön" çalışıyor mu?
5. ✅ Geçersiz slug → 404 göster

### Yazar Test

1. ✅ `/author` aç
2. ✅ Başlık gir → slug otomatik oluşsun
3. ✅ İçerik yaz
4. ✅ "Yayınla" tıkla
5. ✅ Başarı mesajı + transaction bilgileri
6. ✅ "Yazıyı Görüntüle" linki çalışsın

### Admin Test

1. ✅ `/admin` aç
2. ✅ Test adresi gir: `0x1111...1111`
3. ✅ "Yazar Yetkisi Ver" tıkla
4. ✅ Listeye eklensin
5. ✅ Duplicate adres hata versin

---

## 🎉 Sonuç

**BAŞARILI!** ✅

Production'a uygun CMS yapısı hazır:

- ✅ Dashboard (tüm yazılar listesi)
- ✅ Dinamik slug sayfaları (`/[slug]`)
- ✅ Yazar paneli (yeni yazı oluşturma)
- ✅ Admin paneli (yazar yönetimi)
- ✅ Navbar (tüm sayfalarda)
- ✅ Responsive tasarım
- ✅ Dark mode
- ✅ Abstraction layer (mock → real)

**Sonraki adım**: Gerçek Walrus/Sui entegrasyonları!

---

**Dokümantasyon**: [ABSTRACTION_GUIDE.md](./frontend/ABSTRACTION_GUIDE.md)

