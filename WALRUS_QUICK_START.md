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
NEXT_PUBLIC_PACKAGE_ID=0xece693eb8a18802b2370ab8d8b5eebbfcba0af803a7640331edbf808081b6672
NEXT_PUBLIC_REGISTRY_ID=0xc037939d8d784a2327b745d2900c5dfbc01c9447de1f9ef6e0ccc3158abb20fa
NEXT_PUBLIC_ADMIN_CAP_ID=0x31fc352d54bfa0aa1a8137c87c22acfa1483cb96e161bef63541b06c0bbfad9b

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

