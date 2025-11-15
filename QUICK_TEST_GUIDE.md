# 🚀 Quick Test Guide - YENİ DEPLOYMENT

## ✅ Tamamlananlar

1. ✅ Kontrat yeni cüzdanla deploy edildi
2. ✅ ENV dosyası güncellendi
3. ✅ Frontend yeniden başlatıldı

## 👤 YENİ Admin Cüzdan

```
0xf5a596ea7e04f69663cd4e4c226cca57cd8aba90a5526058804ffbae730595b0
```

**Bu cüzdan artık admin!**

## 🧪 Test Adımları

### 1. Tarayıcıda Sayfayı Yenile
```
http://localhost:3000
```
**Hard refresh:** CTRL + SHIFT + R (veya CMD + SHIFT + R)

### 2. Wallet Bağlantısı
- "Connect Wallet" butonuna tıkla
- **ÖNEMLİ:** Admin cüzdanla bağlan (`0xf5a5...`)
- Sui Wallet'ta doğru cüzdanı seç

### 3. Admin Paneline Git
```
http://localhost:3000/admin
```

**Görmemiz gerekenler:**
- ✅ Admin Address: `0xf5a5...` (senin cüzdan)
- ✅ Authority Status: **"Admin_Capability ✓"** (yeşil)
- ✅ Console: `✅ Admin capability found: 0x31fc...`

### 4. Author Capability Ver (İsterseniz)

İkinci bir cüzdana author yetkisi vermek isterseniz:

1. Author Name: "Test Author"
2. Sui Wallet Address: 
   ```
   0x984715d24efb11ea762f2e5aecc6b55a0f76ce3ef16a7ded054b0be61600cb30
   ```
   (veya başka bir adres)
3. "Grant Author Permission" tıkla
4. Transaction'ı onayla
5. Success!

### 5. Article Yayınla (`/author` sayfasında)

1. Title: "My First Real Article"
2. Slug: "my-first-real-article"
3. Content:
   ```markdown
   # Hello Sui Blockchain!
   
   This is my first article published with the new deployment.
   
   - Admin capability ✓
   - Decentralized CMS ✓
   - Immutable content ✓
   ```
4. "Publish Article" tıkla
5. Transaction'ı onayla
6. 🎉 **Başarı!**

## 📊 Beklenen Console Çıktısı

```
⛓️  Using Sui Blockchain
👛 Using Sui Wallet
🎭 Using Mock Storage
✅ Admin capability found: 0x31fc352d54bfa0aa1a8137c87c22acfa1483cb96e161bef63541b06c0bbfad9b
✅ Content uploaded: mock_walrus_blob_...
✅ Page published: <TRANSACTION_HASH>
```

## 🔗 Explorer Links

**Transaction'larını kontrol et:**
- Package: https://suiscan.xyz/testnet/object/0xece693eb8a18802b2370ab8d8b5eebbfcba0af803a7640331edbf808081b6672
- Registry: https://suiscan.xyz/testnet/object/0xc037939d8d784a2327b745d2900c5dfbc01c9447de1f9ef6e0ccc3158abb20fa

## ⚠️ Önemli Notlar

1. **Doğru cüzdanla bağlan:** `0xf5a5...` ile başlayan cüzdan
2. **Testnet'te ol:** Wallet'ın testnet'e bağlı olduğundan emin ol
3. **Yeterli SUI:** Gas için SUI token olmalı
4. **Sayfayı yenile:** ENV değişiklikleri için hard refresh gerekli

## 🎯 Başarı Kriterleri

- [ ] Frontend yüklendi
- [ ] Admin cüzdanla bağlandı
- [ ] Admin capability tespit edildi
- [ ] Article publish edildi
- [ ] Transaction hash alındı
- [ ] Explorer'da transaction görüldü

---

**Şimdi test et ve sonuçları paylaş!** 🚀

