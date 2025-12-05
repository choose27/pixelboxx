# API Examples

Comprehensive examples for testing the PixelBoxx AI Service.

## Setup

Make sure the service is running:

```bash
./run.sh
```

## Health Check Examples

### Basic Health Check

```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "pixelboxx-ai-service",
  "timestamp": "2025-12-04T18:30:00.000000",
  "version": "1.0.0"
}
```

### Readiness Check

```bash
curl http://localhost:8000/health/ready
```

**Response:**
```json
{
  "ready": true,
  "checks": {
    "anthropic_api_key": false,
    "mock_mode": true
  },
  "timestamp": "2025-12-04T18:30:00.000000"
}
```

### Design Endpoint Health

```bash
curl http://localhost:8000/design/health
```

## Design Generation Examples

### Example 1: Cyberpunk Theme

Generate a cyberpunk-themed design with high animations:

```bash
curl -X POST http://localhost:8000/design/from-description \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Cyberpunk city at night, neon purple and cyan lights, futuristic and edgy",
    "preferences": {
      "dark_mode": true,
      "animation_level": "high",
      "neon_intensity": "high",
      "pixel_density": "heavy"
    }
  }'
```

### Example 2: Vaporwave Aesthetic

```bash
curl -X POST http://localhost:8000/design/from-description \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Vaporwave aesthetic, pink and cyan gradient, retro 80s computer graphics, dreamy and nostalgic",
    "preferences": {
      "dark_mode": false,
      "animation_level": "medium",
      "neon_intensity": "medium"
    }
  }'
```

### Example 3: Minimal Dark Theme

```bash
curl -X POST http://localhost:8000/design/from-description \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Minimal dark theme, subtle accents, clean and professional",
    "preferences": {
      "dark_mode": true,
      "animation_level": "low",
      "pixel_density": "minimal",
      "high_contrast": true
    }
  }'
```

### Example 4: Neon Gaming Theme

```bash
curl -X POST http://localhost:8000/design/from-description \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Gaming setup with RGB lights, green and red neon accents, energetic and bold",
    "preferences": {
      "dark_mode": true,
      "animation_level": "high",
      "neon_intensity": "high"
    }
  }'
```

### Example 5: Pastel Pixel Art

```bash
curl -X POST http://localhost:8000/design/from-description \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Soft pastel colors, pixel art game aesthetic, cute and friendly",
    "preferences": {
      "dark_mode": false,
      "animation_level": "medium",
      "pixel_density": "heavy"
    }
  }'
```

## Image Upload Examples

### Upload Image from File

```bash
curl -X POST http://localhost:8000/design/from-image \
  -F "image=@/path/to/inspiration.jpg"
```

### Upload Image with Preferences

```bash
curl -X POST http://localhost:8000/design/from-image \
  -F "image=@/path/to/inspiration.jpg" \
  -F 'preferences={"dark_mode": true, "animation_level": "high"}'
```

### Example with cURL and JSON preferences

```bash
curl -X POST http://localhost:8000/design/from-image \
  -F "image=@/path/to/cyberpunk-city.jpg" \
  -F 'preferences={
    "dark_mode": true,
    "animation_level": "high",
    "neon_intensity": "high",
    "pixel_density": "normal"
  }'
```

## Using with API Key (Production)

When API key authentication is enabled:

```bash
curl -X POST http://localhost:8000/design/from-description \
  -H "X-API-Key: your-internal-service-key" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Dark theme with neon accents",
    "preferences": {"dark_mode": true}
  }'
```

## Response Format

All design endpoints return:

```json
{
  "css": "/* Full CSS code here */\n:root {\n  --primary-color: #FF006E;\n  ...\n}",
  "explanation": "Generated a vibrant cyberpunk design with an energetic mood. The color palette includes #FF006E, #8338EC, #3A86FF. Layout style: centered with dynamic asymmetric elements.",
  "colors": ["#FF006E", "#8338EC", "#3A86FF", "#FB5607", "#FFBE0B"]
}
```

## Using jq for Pretty Output

Install jq for formatted JSON output:

```bash
curl -s http://localhost:8000/design/from-description \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Cyberpunk theme",
    "preferences": {"dark_mode": true}
  }' | jq '.'
```

Extract only the CSS:

```bash
curl -s http://localhost:8000/design/from-description \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Cyberpunk theme",
    "preferences": {"dark_mode": true}
  }' | jq -r '.css'
```

Extract only the colors:

```bash
curl -s http://localhost:8000/design/from-description \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Cyberpunk theme",
    "preferences": {"dark_mode": true}
  }' | jq -r '.colors[]'
```

## Saving Output to File

Save the CSS to a file:

```bash
curl -s http://localhost:8000/design/from-description \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Cyberpunk theme",
    "preferences": {"dark_mode": true}
  }' | jq -r '.css' > generated-profile.css
```

Save the full response:

```bash
curl -s http://localhost:8000/design/from-description \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Cyberpunk theme",
    "preferences": {"dark_mode": true}
  }' > response.json
```

## Testing Error Handling

### Missing Description

```bash
curl -X POST http://localhost:8000/design/from-description \
  -H "Content-Type: application/json" \
  -d '{
    "description": "",
    "preferences": {"dark_mode": true}
  }'
```

**Expected:** 400 Bad Request

### Invalid Image Type

```bash
curl -X POST http://localhost:8000/design/from-image \
  -F "image=@/path/to/document.pdf"
```

**Expected:** 400 Bad Request

### Missing API Key (when auth enabled)

```bash
# With API_KEY set in .env
curl -X POST http://localhost:8000/design/from-description \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test"
  }'
```

**Expected:** 401 Unauthorized

## Integration Testing Script

Create a file `test-all.sh`:

```bash
#!/bin/bash

echo "Testing all endpoints..."

# Health checks
echo "1. Health check..."
curl -s http://localhost:8000/health | jq .

# Design from description
echo "2. Design from description..."
curl -s -X POST http://localhost:8000/design/from-description \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Cyberpunk theme with neon accents",
    "preferences": {"dark_mode": true, "animation_level": "high"}
  }' | jq '{css: .css[:100], explanation: .explanation, colors: .colors}'

echo "All tests complete!"
```

Run it:

```bash
chmod +x test-all.sh
./test-all.sh
```

## Using with JavaScript/TypeScript

```typescript
const response = await fetch('http://localhost:8000/design/from-description', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.AI_SERVICE_API_KEY || '',
  },
  body: JSON.stringify({
    description: 'Cyberpunk theme with neon purple accents',
    preferences: {
      dark_mode: true,
      animation_level: 'high',
      neon_intensity: 'high',
    },
  }),
});

const data = await response.json();
console.log('Generated CSS:', data.css);
console.log('Colors:', data.colors);
```

## Using with Python

```python
import requests

response = requests.post(
    'http://localhost:8000/design/from-description',
    json={
        'description': 'Cyberpunk theme with neon purple accents',
        'preferences': {
            'dark_mode': True,
            'animation_level': 'high',
            'neon_intensity': 'high',
        }
    },
    headers={'X-API-Key': 'your-api-key'}
)

data = response.json()
print('CSS:', data['css'][:200])
print('Colors:', data['colors'])
```

## Performance Testing

Test response time:

```bash
time curl -s -X POST http://localhost:8000/design/from-description \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test theme",
    "preferences": {"dark_mode": true}
  }' > /dev/null
```

Load testing with multiple requests:

```bash
for i in {1..10}; do
  curl -s -X POST http://localhost:8000/design/from-description \
    -H "Content-Type: application/json" \
    -d "{\"description\": \"Test theme $i\"}" &
done
wait
echo "Load test complete"
```
