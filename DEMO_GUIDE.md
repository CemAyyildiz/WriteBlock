# WriteBlock Demo Kullanım Kılavuzu

Bu kılavuz, WriteBlock'un mock data ile çalışan demo versiyonunu nasıl kullanacağınızı açıklar.

## 🎯 Demo Amacı

Bu demo, WriteBlock'un UI/UX akışını göstermek için hazırlanmıştır. Gerçek blockchain bağlantısı yerine simülasyonlar kullanır.

## 🚀 Demo'yu Başlatma

### Hızlı Başlangıç

```bash
# Root dizinden
./start-demo.sh
```

veya manuel olarak:

```bash
cd frontend
npm install
npm run dev
```

Tarayıcıda açın: **http://localhost:3000**

## 📱 Görünümler ve Kullanım

### 1. Ana Sayfa (/)

**Amaç**: WriteBlock'u tanıtır ve üç ana görünüme yönlendirir.

**Özellikler**:
- Proje hakkında genel bilgi
- Sistem mimarisi özeti
- Üç görünüm kartı (tıklanabilir)

**Test Adımları**:
1. Her kartın hover efektini gözlemleyin
2. Her karta tıklayarak ilgili sayfaya gidin
3. Responsive tasarımı kontrol edin (tarayıcıyı küçültün)

---

### 2. Okuma Görünümü (/viewer)

**Rol**: Herkes (yetkilendirme gerektirmez)

**Amaç**: Yayınlanmış içeriği görüntüleme

**Özellikler**:
- ✅ Markdown → HTML render
- ✅ Syntax highlighting
- ✅ Version bilgisi (mevcut: v3)
- ✅ Yazar adresi
- ✅ Blockchain metadata
- ✅ Walrus BLOB ID

**Test Adımları**:
1. Sayfa yüklendiğinde markdown içeriğin render edildiğini kontrol edin
2. Alt kısımda versiyon numarasını görün (v3)
3. Yazar adresinin kısaltılmış formatını kontrol edin
4. Blockchain Bilgileri kartındaki detayları inceleyin
5. "Otantiklik Doğrulaması" bilgi kutusunu okuyun

**Mock Data**:
```typescript
page_id: 0
version: 3
author: 0xabcdef...7890
walrus_blob_id: mock_walrus_blob_abc123xyz
```

---

### 3. Yazma Görünümü (/author)

**Rol**: Author (Author_Capability sahibi)

**Amaç**: İçerik oluşturma ve düzenleme

**Özellikler**:
- ✅ SimpleMDE Markdown editörü
- ✅ Canlı önizleme (Preview buton)
- ✅ Yan yana görünüm (Side-by-side)
- ✅ Tam ekran mod
- ✅ Toolbar (bold, italic, heading, list, link, image)
- ✅ Kaydetme simülasyonu
- ✅ Mock Walrus BLOB ID üretimi
- ✅ Mock Sui transaction

**Test Adımları**:

1. **Editörü Test Edin**:
   - Mevcut içeriği görün
   - Yeni satırlar ekleyin
   - Toolbar butonlarını deneyin:
     - Bold (Ctrl/Cmd + B)
     - Italic (Ctrl/Cmd + I)
     - Heading (#, ##, ###)
   - Preview butonuna tıklayın
   - Side-by-side modunu deneyin

2. **Kaydetme İşlemi**:
   - İçerikte değişiklik yapın
   - "Kaydet" butonuna tıklayın
   - Loading animasyonunu gözlemleyin (~2 saniye)
   - Başarı mesajını görün

3. **Başarı Mesajını İnceleyin**:
   - Yeşil başarı kutusu görünmeli
   - Mock Walrus BLOB ID gösterilmeli
   - Mock Sui Transaction Hash gösterilmeli
   - Mesaj 5 saniye sonra otomatik kapanmalı

**Simüle Edilen İşlem Akışı**:
```
1. İçerik → Walrus Upload (~800ms)
   → Yeni BLOB ID: mock_walrus_blob_xyz...

2. BLOB ID → Sui Transaction (~1200ms)
   → TX Hash: 0xabc123...

3. Başarı Mesajı
```

**Mock Kullanıcı**:
```
Adres: 0xabcdef1234567890...
Rol: Author
Capability: Author_Capability ✓
```

---

### 4. Yönetici Görünümü (/admin)

**Rol**: Admin (Admin_Capability sahibi)

**Amaç**: Yazar yetkilendirme ve yönetim

**Özellikler**:
- ✅ Yeni yazar ekleme formu
- ✅ Sui adres validasyonu
- ✅ Mock Author_Capability mint
- ✅ Mock Sui transaction
- ✅ Yetkili yazarlar listesi
- ✅ Gerçek zamanlı liste güncelleme

**Test Adımları**:

1. **Mevcut Yazarları İnceleyin**:
   - "Yetkili Yazarlar" listesini görün
   - 2 mock yazar olmalı:
     - Alice Writer
     - Bob Editor
   - Her yazarın adres ve tarih bilgilerini kontrol edin

2. **Yeni Yazar Ekleyin**:
   
   **Geçerli Test Adresi**:
   ```
   0x1111111111111111111111111111111111111111111111111111111111111111
   ```
   
   Adımlar:
   - "Yazar İsmi" alanına isim girin (örn: "Charlie Content")
   - Sui Wallet Adresi alanına yukarıdaki test adresini yapıştırın
   - "Yazar Yetkisi Ver" butonuna tıklayın
   - Loading animasyonunu gözlemleyin (~1.2 saniye)
   - Başarı mesajını görün

3. **Başarı Sonrası**:
   - Form otomatik temizlenmeli
   - Yeşil başarı kutusu görünmeli
   - Transaction hash gösterilmeli
   - Yeni yazar listeye eklenmiş olmalı
   - Toplam yazar sayısı badge'i güncellenmiş olmalı (3 Yazar)

4. **Validasyon Testleri**:
   
   **Hatalı adres deneyin**:
   ```
   0x123  (çok kısa)
   ```
   Hata mesajı: "Geçersiz Sui adresi formatı..."
   
   **Boş form göndermeyi deneyin**:
   - Buton disabled olmalı
   
   **Aynı adresi tekrar eklemeyi deneyin**:
   Hata mesajı: "Bu adres zaten yazar yetkisine sahip"

**Mock Admin**:
```
Adres: 0x1234567890abcdef...
Rol: Admin
Capability: Admin_Capability ✓
```

**Simüle Edilen İşlem**:
```
grant_author_capability(
  _admin_cap: &Admin_Capability,
  recipient: address,
  ctx: &mut TxContext
)
```

---

## 🎨 UI/UX Özellikleri

### Renk Paleti

```
Primary Blue: #0ea5e9 (Sui rengi)
Success Green: #10b981
Warning Yellow: #f59e0b
Error Red: #ef4444
```

### Dark Mode

- Otomatik sistem tercihi
- Tüm sayfalarda desteklenir
- Markdown içerikte okunabilirlik optimizasyonu

### Responsive Design

**Breakpoints**:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Test**:
1. Chrome DevTools açın (F12)
2. Responsive mode'a geçin (Ctrl/Cmd + Shift + M)
3. Farklı cihaz boyutlarını test edin

### Animasyonlar

- Page transitions: Fade-in
- Button hover: Scale + shadow
- Success messages: Slide-in from top
- Loading spinners: Rotate animation

---

## 🔄 Mock Data Özeti

### Sayfalar
```typescript
MOCK_PAGE = {
  page_id: 0,
  walrus_blob_id: 'mock_walrus_blob_abc123xyz',
  version: 3,
  author: '0xabcdef...',
  created_at: Nov 10, 2024,
  updated_at: Nov 9, 2025,
  markdown_content: '# WriteBlock...'
}
```

### Kullanıcılar
```typescript
Admin:   0x1234567890abcdef...
Author1: 0xabcdef1234567890... (Alice Writer)
Author2: 0x9876543210fedcba... (Bob Editor)
Viewer:  0xfedcba0987654321...
```

### Yazarlar
```typescript
[
  { name: 'Alice Writer', address: '0xabcdef...', granted_at: Nov 10, 2024 },
  { name: 'Bob Editor', address: '0x987654...', granted_at: Jan 1, 2025 }
]
```

---

## 🧪 Test Senaryoları

### Senaryo 1: İçerik Okuyucu Deneyimi
1. Ana sayfadan "Okuma" kartına tıklayın
2. İçeriği okuyun
3. Version ve yazar bilgilerini kontrol edin
4. Blockchain bilgilerini inceleyin

**Beklenen**: Tüm bilgiler doğru görüntülenir, içerik okunabilir.

### Senaryo 2: İçerik Yazarı Deneyimi
1. Ana sayfadan "Yazma" kartına tıklayın
2. Mevcut içeriği düzenleyin
3. Yeni bir başlık ekleyin: `## Test Başlık`
4. "Kaydet" butonuna tıklayın
5. Başarı mesajını bekleyin

**Beklenen**: 
- Editör çalışır
- Kaydetme simülasyonu başarılı
- BLOB ID ve TX Hash görüntülenir

### Senaryo 3: Admin Yazar Yönetimi
1. Ana sayfadan "Yönetici" kartına tıklayın
2. 2 mevcut yazarı görün
3. Yeni yazar ekleyin (test adresi kullanın)
4. Liste güncellemesini kontrol edin

**Beklenen**:
- Form çalışır
- Validasyon doğru
- Yeni yazar listeye eklenir

### Senaryo 4: Tam Akış Testi
1. Viewer'dan içeriği okuyun (v3)
2. Author'a geçin, içerik düzenleyin
3. Kaydedin (simüle, gerçekte v4 olacak)
4. Admin'e geçin, yeni yazar ekleyin
5. Ana sayfaya dönün

**Beklenen**: Tüm geçişler sorunsuz, tüm özellikler çalışır.

---

## 🐛 Bilinen Sınırlamalar

### Gerçek Olmayan Özellikler

❌ **Gerçek Sui Wallet Bağlantısı**
- Mock kullanıcı adresleri kullanılır
- Wallet connect butonu yok

❌ **Gerçek Walrus Upload/Download**
- BLOB ID'ler rastgele üretilir
- İçerik Walrus'a yüklenmez

❌ **Gerçek Blockchain İşlemleri**
- Transaction'lar simüle edilir
- Gas fee hesaplanmaz
- Gerçek network latency'si yok

❌ **Persistent Storage**
- Sayfa yenilendiğinde değişiklikler kaybolur
- Database bağlantısı yok

### Demo Özellikleri

✅ **Çalışan Mock Özellikler**
- UI/UX akışı tam
- Form validasyonları
- Success/error mesajları
- Responsive tasarım
- Dark mode
- Animasyonlar

---

## 📊 Performans Notları

### Optimize Edilmiş Alanlar
- ✅ Next.js App Router (server components)
- ✅ Dynamic import (SimpleMDE)
- ✅ CSS code splitting
- ✅ Image optimization (Next.js)

### İyileştirilebilir Alanlar
- Markdown render memoization
- Lazy loading için intersection observer
- Service worker (PWA)

---

## 🎓 Öğrenme Hedefleri

Bu demo'yu kullanarak şunları öğrenebilirsiniz:

1. **Sui Move Capability Pattern**: Admin/Author yetki sistemi
2. **Walrus Storage Akışı**: BLOB tabanlı içerik yönetimi
3. **Next.js 14 App Router**: Modern React patterns
4. **TypeScript Best Practices**: Type safety
5. **Tailwind CSS**: Utility-first styling
6. **Mock Data Simulation**: Test ortamı hazırlama

---

## 🚀 Sonraki Adımlar

Demo'yu test ettikten sonra:

1. **Gerçek Entegrasyon İçin**: [SETUP.md](./SETUP.md) dosyasına bakın
2. **Contract Detayları**: [CONTRACT_SUMMARY.md](./CONTRACT_SUMMARY.md)
3. **Frontend Mimarisi**: [frontend/README.md](./frontend/README.md)
4. **Katkıda Bulunma**: GitHub'da PR açın

---

## 💬 Geri Bildirim

Demo hakkında geri bildiriminizi GitHub Issues'da paylaşın:

- UI/UX önerileri
- Bug raporları
- Yeni özellik fikirleri
- Dokümantasyon iyileştirmeleri

---

**Keyifli testler! 🎉**

