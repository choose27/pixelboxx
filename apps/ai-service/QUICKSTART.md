# PixelBoxx AI Service - Quick Start Guide

Get the AI service up and running in 5 minutes.

## Prerequisites

- Python 3.11 or higher
- pip (Python package manager)

## Quick Start

### 1. Navigate to the directory

```bash
cd apps/ai-service
```

### 2. Set up environment

```bash
# Copy environment template
cp .env.example .env

# The default settings enable mock mode, so you can start immediately
# without a Claude API key!
```

### 3. Run the service

```bash
# Make the run script executable (first time only)
chmod +x run.sh

# Start the service
./run.sh
```

The script will:
- Create a Python virtual environment (first run only)
- Install dependencies
- Start the FastAPI service on `http://localhost:8000`

### 4. Test it out

Open another terminal and run:

```bash
# Make test script executable
chmod +x test_endpoints.sh

# Run tests
./test_endpoints.sh
```

Or visit the interactive API docs:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Example API Calls

### Generate CSS from description (Mock Mode)

```bash
curl -X POST http://localhost:8000/design/from-description \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Vaporwave aesthetic with pink and cyan colors, retro 80s vibes",
    "preferences": {
      "dark_mode": true,
      "animation_level": "medium"
    }
  }' | jq .
```

### Check service health

```bash
curl http://localhost:8000/health | jq .
```

## Using with Real Claude API

To use the actual Claude API instead of mock responses:

1. Get an Anthropic API key from: https://console.anthropic.com/
2. Edit `.env` and set:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
   ENABLE_MOCK_RESPONSES=false
   ```
3. Restart the service

## Common Issues

### Port already in use

If port 8000 is already in use, edit `.env`:

```
PORT=8001
```

### Python version issues

Make sure you're using Python 3.11+:

```bash
python3 --version
```

### Module import errors

Make sure you're in the virtual environment:

```bash
source venv/bin/activate
pip install -r requirements.txt
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out the API docs at http://localhost:8000/docs
- Integrate with the NestJS backend
- Add your own custom prompts in `prompts/design_prompts.py`

## Stopping the Service

Press `Ctrl+C` in the terminal where the service is running.

## Development Tips

### Hot Reload

The service automatically reloads when you edit Python files (thanks to `--reload` flag).

### View Logs

All logs appear in the terminal where you ran `./run.sh`.

### Test Changes

After making code changes:
1. Save the file (auto-reload happens)
2. Run `./test_endpoints.sh` to verify
3. Check http://localhost:8000/docs for updated API docs

Happy coding!
