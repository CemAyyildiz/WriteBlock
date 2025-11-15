#!/bin/bash

# WriteBlock Demo Başlatma Scripti
# Bu script frontend ve demo ortamını hazırlar

set -e

echo "🚀 WriteBlock Demo Başlatılıyor..."
echo ""

# Renk kodları
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Frontend dizinini kontrol et
if [ ! -d "frontend" ]; then
    echo "❌ Frontend dizini bulunamadı!"
    exit 1
fi

cd frontend

# Node modüllerini kontrol et
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Bağımlılıklar yükleniyor...${NC}"
    npm install
    echo -e "${GREEN}✅ Bağımlılıklar yüklendi${NC}"
    echo ""
else
    echo -e "${GREEN}✅ Bağımlılıklar mevcut${NC}"
    echo ""
fi

# Build kontrolü (opsiyonel)
echo -e "${BLUE}🔍 TypeScript kontrolü yapılıyor...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build başarılı${NC}"
else
    echo -e "${YELLOW}⚠️  Build hatası var, ancak dev sunucu çalışabilir${NC}"
fi
echo ""

# Sunucuyu başlat
echo -e "${BLUE}🌐 Geliştirme sunucusu başlatılıyor...${NC}"
echo ""
echo -e "${GREEN}📍 Uygulama adresi: http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Demo Görünümler:${NC}"
echo "  📖 Okuma:    http://localhost:3000/viewer"
echo "  ✍️  Yazma:    http://localhost:3000/author"
echo "  👑 Yönetici: http://localhost:3000/admin"
echo ""
echo -e "${YELLOW}Sunucuyu durdurmak için CTRL+C basın${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run dev

