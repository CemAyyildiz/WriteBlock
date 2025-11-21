# 🐋 Walrus Storage Research & Implementation Guide

## 📚 Walrus Nedir?

Walrus, Sui ekosisteminde **decentralized storage** (merkezi olmayan depolama) sağlayan bir protokoldür.

### Temel Özellikler:
- **Decentralized**: Merkezi sunucu yok
- **High Availability**: Yüksek erişilebilirlik
- **Sui Entegrasyonu**: Sui blockchain ile native entegrasyon
- **Cost Effective**: Uygun fiyatlı depolama

## 🔗 Önemli Linkler

### Resmi Dokümantasyon
- **Ana Site**: https://walrus.site
- **Docs**: https://docs.walrus.site
- **GitHub**: https://github.com/MystenLabs/walrus-docs

### Testnet Bilgileri
- **Testnet Status**: https://walrus.site/testnet-status
- **Faucet**: https://walrus.site/faucet
- **Explorer**: Henüz public değil

## 🌐 API Endpoints

### Mevcut Bilinen Endpoint'ler:

#### Publisher (Upload)
```
Method: PUT
URL: https://publisher.walrus-testnet.walrus.space/v1/store
Headers: Content-Type: application/octet-stream
Body: Raw file data
```

**Alternatif endpoint'ler dene:**
```
https://walrus-testnet-publisher.nodes.guru/v1/store
https://walrus-testnet-publisher.bartestnet.com/v1/store
https://publisher-testnet.walrus.space/v1/store
```

#### Aggregator (Download)
```
Method: GET
URL: https://aggregator.walrus-testnet.walrus.space/v1/{blobId}
```

**Alternatif endpoint'ler:**
```
https://walrus-testnet-aggregator.nodes.guru/v1/{blobId}
https://walrus-testnet-aggregator.bartestnet.com/v1/{blobId}
https://aggregator-testnet.walrus.space/v1/{blobId}
```

## 🧪 Test Etme Yöntemleri

### 1. Curl ile Upload Test

```bash
# Basit bir dosya upload et
echo "Hello Walrus!" > test.txt

curl -X PUT \
  https://publisher.walrus-testnet.walrus.space/v1/store \
  -H "Content-Type: application/octet-stream" \
  --data-binary @test.txt \
  -v

# Veya direkt string ile
echo "Hello Walrus!" | curl -X PUT \
  https://publisher.walrus-testnet.walrus.space/v1/store \
  -H "Content-Type: application/octet-stream" \
  --data-binary @- \
  -v
```

**Başarılı response örneği:**
```json
{
  "newlyCreated": {
    "blobObject": {
      "id": "0x...",
      "storedEpoch": 100,
      "blobId": "4PeM7Qx9xQ8y...",
      "size": 13,
      "encodingType": "RedStuff",
      "certifiedEpoch": 100
    },
    "encodedSize": 156,
    "cost": 100
  }
}
```

veya zaten varsa:
```json
{
  "alreadyCertified": {
    "blobId": "4PeM7Qx9xQ8y...",
    "event": {...},
    "endEpoch": 200
  }
}
```

### 2. Curl ile Download Test

```bash
# Blob ID'yi yukarıdaki response'dan al
BLOB_ID="4PeM7Qx9xQ8y..."

curl https://aggregator.walrus-testnet.walrus.space/v1/${BLOB_ID}
```

### 3. Browser'da Test

Upload için Postman veya browser extension kullan:
```
Method: PUT
URL: https://publisher.walrus-testnet.walrus.space/v1/store
Body: (raw, binary)
Headers: Content-Type: application/octet-stream
```

## 🔧 Frontend'te Kullanım

### Mevcut Implementation (Güncelleme Gerekebilir)

**Dosya:** `frontend/lib/walrus/walrusStorage.ts`

```typescript
async upload(content: string | Blob): Promise<string> {
  const blob = typeof content === 'string' 
    ? new Blob([content], { type: 'text/plain' }) 
    : content;

  const response = await fetch(`${this.publisherUrl}/v1/store`, {
    method: 'PUT',
    body: blob,
    headers: {
      'Content-Type': 'application/octet-stream',
    },
  });

  const result = await response.json();
  return result.newlyCreated?.blobObject?.blobId 
    || result.alreadyCertified?.blobId;
}
```

## 📋 Araştırma Checklist'i

### İlk Adımlar:
- [ ] Walrus docs'u oku: https://docs.walrus.site
- [ ] Testnet status kontrol et: Çalışıyor mu?
- [ ] Doğru endpoint'leri bul (yukarıdaki curl komutlarıyla test et)

### Curl ile Test:
- [ ] Basit bir text dosyası upload et
- [ ] Response'u incele - blob ID al
- [ ] Blob ID ile download et
- [ ] Content doğru mu kontrol et

### Frontend Test:
- [ ] Doğru endpoint'i `.env.local`'a ekle
- [ ] `walrusStorage.ts`'i gerekirse güncelle
- [ ] Frontend'te upload test et
- [ ] Console'da response'u incele
- [ ] Blob ID'yi browser'da aç

### Sorun Giderme:
- [ ] 404 hatası → Endpoint yanlış, başka endpoint dene
- [ ] CORS hatası → Proxy veya alternatif endpoint gerekebilir
- [ ] 500 hatası → Walrus node down olabilir, bekle/başka node dene
- [ ] Response formatı farklı → Response parsing'i güncelle

## 🛠️ Olası Sorunlar ve Çözümler

### Problem 1: 404 Not Found
**Sebep:** Endpoint değişmiş veya yanlış
**Çözüm:** 
```bash
# Tüm bilinen endpoint'leri test et
for url in \
  "https://publisher.walrus-testnet.walrus.space/v1/store" \
  "https://walrus-testnet-publisher.nodes.guru/v1/store" \
  "https://publisher-testnet.walrus.space/v1/store"
do
  echo "Testing: $url"
  echo "test" | curl -X PUT "$url" \
    -H "Content-Type: application/octet-stream" \
    --data-binary @- -v
  echo -e "\n---\n"
done
```

### Problem 2: CORS Error
**Sebep:** Browser CORS policy
**Çözüm:**
1. Backend proxy kullan
2. Sui wallet ile local signing yap
3. Walrus CLI kullan (sunucu tarafı)

### Problem 3: Response Format Değişmiş
**Sebep:** API versiyonu güncellenmiş
**Çözüm:** Response'u console'a yazdır ve format'ı incele:
```typescript
const result = await response.json();
console.log('Walrus Response:', JSON.stringify(result, null, 2));
```

## 📝 Araştırma Notları İçin Boş Alan

### Çalışan Endpoint'ler:
```
Publisher: 
- 

Aggregator:
- 
```

### Başarılı Upload Testi:
```
Date: 
Blob ID: 
Command: 
Response: 
```

### Response Format:
```json
{
  // Buraya gerçek response'u yapıştır
}
```

### Frontend'te Gerekli Değişiklikler:
```
1. 
2. 
3. 
```

## 🎯 Başarı Kriterleri

✅ Curl ile upload başarılı  
✅ Blob ID alındı  
✅ Curl ile download başarılı  
✅ Frontend'te upload çalışıyor  
✅ Browser'da blob görüntüleniyor  

## 🔍 Faydalı Komutlar

### Network Debug
```bash
# DNS çözümleme kontrol
nslookup publisher.walrus-testnet.walrus.space

# Port açık mı kontrol
nc -zv publisher.walrus-testnet.walrus.space 443

# Endpoint response time
time curl -I https://publisher.walrus-testnet.walrus.space/v1/store
```

### Response Header'ları İncele
```bash
curl -I -X PUT \
  https://publisher.walrus-testnet.walrus.space/v1/store \
  -H "Content-Type: application/octet-stream" \
  --data-binary "test"
```

## 📚 Ekstra Kaynaklar

### Discord / Telegram
Sui ve Walrus community'sine sor:
- Sui Discord: https://discord.gg/sui
- Walrus kanallarına git
- "Testnet publisher endpoint çalışmıyor" diye sor

### GitHub Issues
- https://github.com/MystenLabs/walrus-docs/issues
- Benzer sorunlar var mı kontrol et
- Yeni issue aç

### Walrus CLI
Eğer Node.js/Sui CLI varsa:
```bash
# Walrus CLI kur (eğer varsa)
# Dokümantasyona bak: https://docs.walrus.site
```

## ✨ Final Notes

1. **Önce curl ile test et** - Frontend'e geçmeden önce curl ile çalıştığından emin ol
2. **Endpoint'leri dene** - Farklı publisher node'larını test et
3. **Community'ye sor** - Discord/Telegram'da sor, başkaları da yaşıyor olabilir
4. **Docs'u oku** - Official docs'ta güncel endpoint'ler olabilir
5. **Alternatif çözüm** - Walrus CLI sunucu tarafında kullanılabilir

---

**Başarılar! Bulduğun çalışan endpoint'leri bana söyle, frontend'i güncelleyelim! 🐋**

