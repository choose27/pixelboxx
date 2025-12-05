# PixelBoxx AI Service

FastAPI-based AI service providing design assistance and content moderation for PixelBoxx.

## Features

- **AI Design Assistant**: Generate CSS from inspiration images or text descriptions
- **Claude Vision Integration**: Analyze images to extract design elements (colors, aesthetic, mood)
- **CSS Generation**: Create production-ready CSS for PixelBoxx profiles
- **Mock Mode**: Development mode with mock responses (no API key required)

## Stack

- **Framework:** FastAPI (Python 3.11+)
- **AI Model:** Claude Sonnet 4.5 (Anthropic)
- **Validation:** Pydantic v2
- **HTTP Client:** httpx
- **Server:** Uvicorn

## Architecture

```
apps/ai-service/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── run.sh                 # Development startup script
├── api/
│   ├── design.py          # Design assistant endpoints
│   └── health.py          # Health check endpoints
├── services/
│   └── claude.py          # Claude API wrapper
├── models/
│   └── design.py          # Pydantic models
└── prompts/
    └── design_prompts.py  # AI prompts for design generation
```

## Setup

### 1. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

Required environment variables:
- `ANTHROPIC_API_KEY`: Your Claude API key (optional if using mock mode)
- `API_KEY`: Internal service authentication key
- `ENABLE_MOCK_RESPONSES`: Set to "true" for development without API key

### 4. Run the Service

#### Option A: Using the run script
```bash
./run.sh
```

#### Option B: Using uvicorn directly
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Option C: Using Python directly
```bash
python main.py
```

The service will start on `http://localhost:8000`

## API Endpoints

### Health Checks

#### GET /health
Basic health check.

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "service": "pixelboxx-ai-service",
  "timestamp": "2025-12-04T10:30:00.000Z",
  "version": "1.0.0"
}
```

#### GET /health/ready
Readiness check with dependency status.

```bash
curl http://localhost:8000/health/ready
```

### Design Endpoints

#### POST /design/from-image
Generate CSS from an inspiration image.

**Request:**
```bash
curl -X POST http://localhost:8000/design/from-image \
  -H "X-API-Key: your-internal-service-key" \
  -F "image=@inspiration.jpg" \
  -F 'preferences={"dark_mode": true, "animation_level": "high"}'
```

**Response:**
```json
{
  "css": "/* Generated CSS code */",
  "explanation": "Generated a vibrant cyberpunk design with an energetic mood...",
  "colors": ["#FF006E", "#8338EC", "#3A86FF", "#FB5607", "#FFBE0B"]
}
```

#### POST /design/from-description
Generate CSS from a text description.

**Request:**
```bash
curl -X POST http://localhost:8000/design/from-description \
  -H "X-API-Key: your-internal-service-key" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Dark theme with neon purple accents, cyberpunk vibes, lots of glow effects",
    "preferences": {
      "dark_mode": true,
      "animation_level": "high",
      "neon_intensity": "high"
    }
  }'
```

**Response:**
```json
{
  "css": "/* Generated CSS code */",
  "explanation": "Created a design inspired by your description...",
  "colors": ["#8338EC", "#3A86FF", "#FF006E"]
}
```

#### GET /design/health
Health check for design endpoints.

```bash
curl http://localhost:8000/design/health
```

## Authentication

All endpoints (except health checks) require an API key header:

```
X-API-Key: your-internal-service-key
```

This is configured in `.env` as `API_KEY` and is used for internal service-to-service authentication (e.g., from the NestJS backend).

## Mock Mode

For development without a Claude API key, set in `.env`:

```
ENABLE_MOCK_RESPONSES=true
```

The service will return realistic mock responses instead of calling the Claude API.

## Design Preferences

Available preferences for customization:

```typescript
{
  "dark_mode": boolean,              // Use dark theme (default: true)
  "animation_level": string,         // "none" | "low" | "medium" | "high" (default: "medium")
  "high_contrast": boolean,          // Accessibility mode (default: false)
  "pixel_density": string,           // "minimal" | "normal" | "heavy" (default: "normal")
  "neon_intensity": string          // "low" | "medium" | "high" (default: "medium")
}
```

## PixelBoxx Design System

The AI generates CSS that targets these PixelBoxx profile selectors:

- `.pixelpage` - Main profile container
- `.profile-header` - Hero/banner area
- `.profile-avatar` - User avatar
- `.profile-bio` - About me section
- `.top-friends` - Top friends grid
- `.top-friends-item` - Individual friend card
- `.music-player` - Music widget
- `.photo-gallery` - Photo gallery grid
- `.photo-gallery-item` - Individual photo
- `.guestbook` - Guestbook/comments section
- `.guestbook-entry` - Individual comment
- `.widget` - Generic widget container
- `.profile-badge` - Custom badges

## Design Aesthetic

All generated CSS follows the PixelBoxx aesthetic:

- **Pixel Art**: 8px grid system, pixelated rendering, box-shadow borders
- **Neon**: Glowing text and elements, vibrant colors
- **Retro-Futuristic**: 80s/90s nostalgia meets modern web design

## API Documentation

Interactive API documentation is available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Integration with NestJS Backend

The NestJS backend should call this service for AI features:

```typescript
// Example NestJS service integration
async generateDesignFromImage(imageBuffer: Buffer, preferences: DesignPreferences) {
  const formData = new FormData();
  formData.append('image', imageBuffer, 'inspiration.jpg');
  formData.append('preferences', JSON.stringify(preferences));

  const response = await fetch('http://localhost:8000/design/from-image', {
    method: 'POST',
    headers: {
      'X-API-Key': process.env.AI_SERVICE_API_KEY,
    },
    body: formData,
  });

  return response.json();
}
```

## Error Handling

The API returns standard HTTP status codes:

- `200`: Success
- `400`: Bad request (invalid input)
- `401`: Unauthorized (missing/invalid API key)
- `500`: Server error (API failure, processing error)

Error response format:
```json
{
  "detail": "Error message description"
}
```

## Development

### Running Tests
```bash
# TODO: Add pytest tests
pytest
```

### Linting
```bash
# TODO: Add linting
black .
flake8 .
```

## Production Deployment

For production deployment:

1. Set `ENABLE_MOCK_RESPONSES=false`
2. Provide valid `ANTHROPIC_API_KEY`
3. Set secure `API_KEY` for internal auth
4. Configure `ALLOWED_ORIGINS` for CORS
5. Use a production ASGI server (Gunicorn + Uvicorn workers)

```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Future Enhancements

Phase 2 features (not yet implemented):

- Content moderation (image/text scanning)
- Template recommendation engine
- Rate limiting and request queuing
- CSS caching for similar requests
- Cost tracking and analytics
- Design refinement chat (iterative improvements)

## License

Part of the PixelBoxx project.
