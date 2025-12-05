"""
PixelBoxx AI Service - FastAPI application.

Provides AI-powered design assistance and content moderation.
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import os
from contextlib import asynccontextmanager

from api import design, health

# Load environment variables
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    print("Starting PixelBoxx AI Service...")
    print(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"Mock Mode: {os.getenv('ENABLE_MOCK_RESPONSES', 'true')}")

    yield

    # Shutdown
    print("Shutting down PixelBoxx AI Service...")


# Initialize FastAPI app
app = FastAPI(
    title="PixelBoxx AI Service",
    description="AI-powered design assistance and content moderation for PixelBoxx",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Internal API Key Authentication Middleware
@app.middleware("http")
async def authenticate_request(request: Request, call_next):
    """Verify internal API key for non-health endpoints."""
    # Skip auth for health checks and docs
    if request.url.path in ["/", "/health", "/health/ready", "/docs", "/redoc", "/openapi.json"]:
        return await call_next(request)

    # Check API key for other endpoints
    api_key = os.getenv("API_KEY")
    if api_key:
        provided_key = request.headers.get("X-API-Key")
        if provided_key != api_key:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or missing API key"},
            )

    return await call_next(request)


# Include routers
app.include_router(health.router)
app.include_router(design.router)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with service info."""
    return {
        "service": "PixelBoxx AI Service",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    print(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected error occurred",
            "type": type(exc).__name__,
        },
    )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info",
    )
