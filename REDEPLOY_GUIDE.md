# Kontratı Yeni Cüzdanla Yeniden Deploy Etme

## Neden Gerekli?

- Admin Capability sadece deploy eden kişiye verilir
- Transfer edilemez (güvenlik için)
- Yeni bir admin için kontratı yeniden deploy etmek gerekir

## Adımlar

### 1. Yeni Cüzdana Geç

```bash
cd /Users/cemayyildiz/projects/WriteBlock/contract

# Aktif cüzdanı kontrol et
sui client active-address

# Eğer doğru cüzdan değilse, geç
sui client switch --address 0x984715d24efb11ea762f2e5aecc6b55a0f76ce3ef16a7ded054b0be61600cb30
```

### 2. Yeterli SUI Token Kontrolü

```bash
# Gas token kontrolü
sui client gas

# Eğer yeterli değilse, faucet'tan al
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
--header 'Content-Type: application/json' \
--data-raw "{
  \"FixedAmountRequest\": {
    \"recipient\": \"0x984715d24efb11ea762f2e5aecc6b55a0f76ce3ef16a7ded054b0be61600cb30\"
  }
}"
```

### 3. Kontratı Publish Et

```bash
sui client publish --gas-budget 100000000
```

### 4. Yeni Deployment Bilgilerini Kaydet

Deployment çıktısından:
- **Package ID**: `0x...`
- **Registry ID**: CMS_Registry shared object
- **Admin Cap ID**: Admin_Capability (sana transfer edilir)

### 5. Frontend ENV Dosyasını Güncelle

```bash
cd /Users/cemayyildiz/projects/WriteBlock/frontend

cat > .env.local << 'EOF'
NEXT_PUBLIC_STORAGE_PROVIDER=mock
NEXT_PUBLIC_BLOCKCHAIN_PROVIDER=sui
NEXT_PUBLIC_WALLET_PROVIDER=sui
NEXT_PUBLIC_SUI_NETWORK=testnet

# YENİ DEPLOYMENT BİLGİLERİ
NEXT_PUBLIC_PACKAGE_ID=<YENİ_PACKAGE_ID>
NEXT_PUBLIC_REGISTRY_ID=<YENİ_REGISTRY_ID>
NEXT_PUBLIC_ADMIN_CAP_ID=<YENİ_ADMIN_CAP_ID>

NEXT_PUBLIC_DEBUG=true
EOF
```

### 6. Frontend'i Yeniden Başlat

```bash
# Eski server'ı durdur
pkill -f "next dev"

# Yeniden başlat
npm run dev
```

### 7. Test Et

1. Frontend'e git (`http://localhost:3000`)
2. Wallet'ı bağla (admin cüzdanın)
3. `/admin` - Admin capability olmalı
4. `/author` - Article publish edebilmeli

---

## Eski vs Yeni Deployment

### Eski Deployment (Kalsın)
```
Package: 0x6fb7eca07ddbf4ae014116b6f44e35ed647af02b905a1e8c827d298f8e1c0027
Registry: 0x0cbf0decdfba5117d9eb2c9a7af7f49512a497d85e19f9359eded739c09ef848
Admin: 0xb3900e01dbd1b9b66794053d9237145739c37398df07b15b55c2d47a6bb73f24
```

### Yeni Deployment
```
Package: <YENİ>
Registry: <YENİ>
Admin: 0x984715d24efb11ea762f2e5aecc6b55a0f76ce3ef16a7ded054b0be61600cb30
```

---

## Neden İki Deployment?

Her deployment ayrı bir "instance" oluşturur:
- Farklı Registry'ler
- Farklı admin'ler
- Farklı page'ler
- Bağımsız sistemler

Test için iki sistem de çalışabilir!

