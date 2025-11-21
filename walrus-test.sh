#!/bin/bash

# 🐋 Walrus Endpoint Test Script
# Bu script farklı Walrus publisher endpoint'lerini test eder

echo "🐋 Walrus Publisher Endpoint Test"
echo "=================================="
echo ""

# Test edilecek endpoint'ler
ENDPOINTS=(
  "https://publisher.walrus-testnet.walrus.space/v1/store"
  "https://walrus-testnet-publisher.nodes.guru/v1/store"
  "https://publisher-testnet.walrus.space/v1/store"
  "https://publisher.walrus-testnet.mystenlabs.com/v1/store"
)

# Test data
TEST_DATA="Hello Walrus! This is a test from WriteBlock."

echo "Test data: $TEST_DATA"
echo ""

# Her endpoint'i test et
for url in "${ENDPOINTS[@]}"
do
  echo "-----------------------------------"
  echo "Testing: $url"
  echo ""
  
  # PUT request gönder
  response=$(echo "$TEST_DATA" | curl -X PUT "$url" \
    -H "Content-Type: application/octet-stream" \
    --data-binary @- \
    -w "\nHTTP_CODE:%{http_code}" \
    -s \
    2>&1)
  
  # HTTP kodu al
  http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
  body=$(echo "$response" | sed '/HTTP_CODE/d')
  
  echo "HTTP Code: $http_code"
  
  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo "✅ SUCCESS!"
    echo "Response:"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    echo ""
    echo "🎉 ÇALIŞAN ENDPOINT BULUNDU: $url"
    
    # Blob ID'yi çıkar
    blob_id=$(echo "$body" | grep -o '"blobId":"[^"]*"' | cut -d'"' -f4 | head -1)
    if [ ! -z "$blob_id" ]; then
      echo "📦 Blob ID: $blob_id"
      echo ""
      echo "Download testi için:"
      echo "curl https://aggregator.walrus-testnet.walrus.space/v1/$blob_id"
    fi
    break
  else
    echo "❌ FAILED"
    echo "Response: $body"
  fi
  echo ""
done

echo "=================================="
echo "Test tamamlandı!"

