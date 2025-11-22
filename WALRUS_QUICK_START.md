# 🐋 Walrus Quick Start - Hemen Test Et!

## 🚀 Hızlı Test

### 1. Test Script'i Çalıştır

```bash
cd /Users/cemayyildiz/projects/WriteBlock
./walrus-test.sh
```

Bu script otomatik olarak bilinen endpoint'leri test edecek ve çalışan olanı bulacak!

### 2. Manuel Test (Curl)

```bash
# Basit test
echo "Hello Walrus!" | curl -X PUT \
  https://publisher.walrus-testnet.walrus.space/v1/store \
  -H "Content-Type: application/octet-stream" \
  --data-binary @- \
  -v

# Response'u incele
# Başarılıysa blob ID alacaksın
```

### 3. Blob ID ile Download Test

```bash
# Blob ID'yi yukarıdan al
BLOB_ID="buraya-blob-id-yaz"

# Download et
curl https://aggregator.walrus-testnet.walrus.space/v1/${BLOB_ID}
```

## 📝 Çalışan Endpoint'i Buraya Yaz

Çalışan endpoint'i bulduktan sonra `.env.local` dosyasını güncelle:

```bash
cd frontend

cat > .env.local << 'EOF'
NEXT_PUBLIC_STORAGE_PROVIDER=walrus
NEXT_PUBLIC_BLOCKCHAIN_PROVIDER=sui
NEXT_PUBLIC_WALLET_PROVIDER=sui
NEXT_PUBLIC_SUI_NETWORK=testnet

# Deployed Contract IDs
NEXT_PUBLIC_PACKAGE_ID=0xa9cf8a94da6039ec241272862a77712da6451b3c3a4411d690fdac50242842ba
NEXT_PUBLIC_REGISTRY_ID=0x0dae858984bacd9a5753370dcf5a6d364fbcb4bcd69e69d6d31d1fdf6a71c822
NEXT_PUBLIC_ADMIN_CAP_ID=0xf888a699ae8e7b35cf0ec77133108ca7014b0f835c204a4607ba460db5f1af0c

# ÇALIŞAN ENDPOINT'LERİ BURAYA YAZ
NEXT_PUBLIC_WALRUS_PUBLISHER_URL=BURAYA-ÇALIŞAN-PUBLISHER-URL
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space

NEXT_PUBLIC_DEBUG=true
EOF
```

## 🔍 Araştırma Adımları

1. **Curl testi yap** → Çalışan endpoint bul
2. **Blob ID al** → Response'dan çıkar
3. **Download test** → Blob ID ile içeriği indir
4. **ENV güncelle** → Çalışan URL'i ekle
5. **Frontend test** → Article publish et

## 📚 Kaynaklar

- Discord: https://discord.gg/sui (Walrus kanalları)
- Docs: https://docs.walrus.site
- GitHub: https://github.com/MystenLabs/walrus-docs

## ✅ Bana Geri Dön

Çalışan endpoint'i bulunca bana söyle:
- Hangi URL çalıştı?
- Blob ID'yi aldın mı?
- Download test başarılı mı?

Sonra frontend'i güncelleyelim! 🚀

