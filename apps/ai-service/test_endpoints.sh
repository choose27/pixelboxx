#!/bin/bash

# PixelBoxx AI Service - Endpoint Testing Script
# Make sure the service is running before executing this script!

BASE_URL="http://localhost:8000"
API_KEY="your-internal-service-key"

echo "=================================="
echo "PixelBoxx AI Service - Testing"
echo "=================================="
echo ""

# Test 1: Root endpoint
echo "[1/5] Testing root endpoint..."
curl -s "$BASE_URL/" | jq .
echo ""
echo ""

# Test 2: Health check
echo "[2/5] Testing health check..."
curl -s "$BASE_URL/health" | jq .
echo ""
echo ""

# Test 3: Readiness check
echo "[3/5] Testing readiness check..."
curl -s "$BASE_URL/health/ready" | jq .
echo ""
echo ""

# Test 4: Design health
echo "[4/5] Testing design health..."
curl -s "$BASE_URL/design/health" | jq .
echo ""
echo ""

# Test 5: Design from description (with mock mode)
echo "[5/5] Testing design from description..."
curl -s -X POST "$BASE_URL/design/from-description" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Dark theme with neon purple accents, cyberpunk vibes, lots of glow effects",
    "preferences": {
      "dark_mode": true,
      "animation_level": "high",
      "neon_intensity": "high"
    }
  }' | jq .
echo ""
echo ""

echo "=================================="
echo "Testing Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. To test image upload, try:"
echo "   curl -X POST $BASE_URL/design/from-image -F 'image=@/path/to/image.jpg'"
echo ""
echo "2. View interactive docs at:"
echo "   $BASE_URL/docs"
echo ""
