# 🧪 Sui Blockchain Test Guide

## ✅ Şu Ana Kadar Yapılanlar

1. ✅ Kontrat testnet'e deploy edildi
2. ✅ ENV dosyası konfigüre edildi
3. ✅ Frontend Sui mode'da çalışıyor
4. ✅ Author sayfası wallet entegrasyonu tamamlandı
5. ✅ Blockchain client'a wallet handler'ları eklendi

## 🔧 Yapılan Değişiklikler

### Author Page (`/author`)
- ✅ Sui wallet hooks entegrasyonu
- ✅ `initializeSuiWallet` fonksiyonu çağrılıyor
- ✅ User capabilities otomatik fetch ediliyor
- ✅ `createPage` gerçek capability ID'leri ile çalışıyor
- ✅ Connected address gerçek wallet'tan gösteriliyor
- ✅ Capability durumu badge'de gösteriliyor

## 🧪 Test Adımları

### 1. Sayfayı Yenile (Hard Refresh)
```
CTRL + SHIFT + R (veya CMD + SHIFT + R)
```

### 2. Console Kontrolü (F12)
Görmemiz gerekenler:
```
⛓️  Using Sui Blockchain
👛 Using Sui Wallet
🎭 Using Mock Storage
```

### 3. Wallet Bağlantısını Kontrol Et

**Navbar'da:**
- "Connect Wallet" butonu olmalı (Sui dApp Kit butonu)
- Bağlandıktan sonra: Adres ve "Admin" role'ü görünmeli

**Author sayfasında (`/author`):**
- Connected Address: Gerçek wallet adresiniz
- Badge: "✓ Authorized" (admin capability'niz var)

### 4. İlk Makaleyi Publish Et! 🚀

**Adımlar:**
1. `/author` sayfasına git
2. Wallet bağlıysa ve "✓ Authorized" görünüyorsa hazırsın
3. Bir test makalesi yaz:
   - **Title:** "My First Sui Article"
   - **Slug:** "my-first-sui-article"
   - **Excerpt:** "Testing Sui blockchain integration"
   - **Content:** 
   ```markdown
   # Hello Sui!

   This is my first article published on Sui blockchain with WriteBlock.

   - Decentralized storage ✓
   - Blockchain metadata ✓
   - Immutable content ✓
   ```
4. **"Publish Article"** butonuna tıkla
5. Sui Wallet popup'ında **transaction'ı onayla**
6. Başarı mesajını bekle!

### 5. Transaction'ı Kontrol Et

**Console'da göreceksin:**
```
✅ Content uploaded: mock_walrus_blob_...
✅ Page published: <TRANSACTION_HASH>
```

**Transaction'ı Explorer'da gör:**
```
https://suiscan.xyz/testnet/tx/<TRANSACTION_HASH>
```

### 6. Page Object'i Kontrol Et

Transaction'da göreceksin:
- **Created Object:** `Page_Metadata` (Shared object)
- **Page ID:** Yeni oluşturulan sayfa
- **Registry:** Güncellenen registry (total_pages artmış)

### 7. Registry Stats Kontrolü

Terminal'de kontrol et:
```bash
sui client object 0x0cbf0decdfba5117d9eb2c9a7af7f49512a497d85e19f9359eded739c09ef848
```

Görmemiz gereken:
```yaml
total_pages: 1 (veya daha fazla)
created_at: ...
page_registry: {...}
```

## ⚠️ Olası Sorunlar ve Çözümleri

### "You need Author or Admin capability"
**Sorun:** Admin capability tespit edilemedi  
**Çözüm:** 
1. Console'da hata var mı kontrol et
2. Wallet'ın doğru adres olduğundan emin ol
3. Admin cap ID doğru mu kontrol et:
   ```bash
   sui client object 0x3f85227a4a2d624cc1b43be98bb29593e46c277f90a559f4a1e8e22caa82b034
   ```

### "Registry ID not configured"
**Sorun:** ENV dosyasında Registry ID yok  
**Çözüm:** `.env.local` dosyasını kontrol et:
```bash
cat frontend/.env.local
```

### "Transaction failed"
**Sorun:** Blockchain transaction başarısız  
**Çözümleri:**
1. Yeterli SUI token var mı kontrol et: `sui client gas`
2. Testnet'e bağlı mısın: `sui client active-env`
3. Transaction detaylarına bak (console'daki hata mesajı)

### "Wallet not connected"
**Sorun:** Wallet handler'ları set edilmedi  
**Çözüm:** 
1. Sayfayı yenile (hard refresh)
2. Wallet'ı disconnect/connect yap
3. Browser console'da hata var mı kontrol et

## 📊 Başarı Kriterleri

Bunları görebilirsen başarılısın:

- [x] Frontend Sui mode'da çalışıyor
- [x] Wallet bağlandı
- [x] Admin capability tespit edildi
- [x] Article form dolduruldu
- [ ] **Transaction başarıyla tamamlandı** ⭐
- [ ] **Page_Metadata object oluşturuldu** ⭐
- [ ] **Registry güncellendi (total_pages arttı)** ⭐

## 🎉 Başarılı Olursan

Tebrikler! Şunları başardın:
- ✅ Sui testnet'e smart contract deploy ettim
- ✅ Frontend'i gerçek blockchain'e bağladın
- ✅ İlk decentralized article'ı yayınladın
- ✅ Blockchain üzerinde immutable content oluşturdun

## 📝 Sonraki Adımlar

1. ✅ Create page işlemi çalıştı
2. ⏭️ Update page functionality test et
3. ⏭️ Grant author capability test et (Admin panel)
4. ⏭️ Ana sayfada blockchain'den veri çekmeyi implement et
5. ⏭️ Walrus storage'a geçiş (şu an mock)

---

**Şimdi test et ve sonuçları paylaş!** 🚀

