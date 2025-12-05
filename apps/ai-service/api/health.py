"""
Health check endpoints.
"""

from fastapi import APIRouter
from datetime import datetime
import os

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "service": "pixelboxx-ai-service",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
    }


@router.get("/ready")
async def readiness_check():
    """Readiness check - verify all dependencies are available."""
    api_key_set = bool(os.getenv("ANTHROPIC_API_KEY"))
    mock_mode = os.getenv("ENABLE_MOCK_RESPONSES", "true").lower() == "true"

    ready = api_key_set or mock_mode

    return {
        "ready": ready,
        "checks": {
            "anthropic_api_key": api_key_set,
            "mock_mode": mock_mode,
        },
        "timestamp": datetime.utcnow().isoformat(),
    }
