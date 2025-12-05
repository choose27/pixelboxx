"""
Design assistant API endpoints.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import Optional
import json

from models.design import (
    DesignPreferences,
    CSSGenerationResponse,
    TextDesignRequest,
)
from services.claude import ClaudeService

router = APIRouter(prefix="/design", tags=["design"])


def get_claude_service():
    """Dependency for Claude service."""
    return ClaudeService()


@router.post("/from-image", response_model=CSSGenerationResponse)
async def design_from_image(
    image: UploadFile = File(..., description="Inspiration image file"),
    preferences: Optional[str] = Form(None, description="JSON string of DesignPreferences"),
    claude_service: ClaudeService = Depends(get_claude_service),
):
    """
    Generate CSS from an inspiration image.

    Args:
        image: Uploaded image file (JPEG, PNG, GIF)
        preferences: Optional JSON string of design preferences

    Returns:
        CSSGenerationResponse with generated CSS and metadata
    """
    # Validate file type
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Read image bytes
    try:
        image_bytes = await image.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read image: {str(e)}")

    # Parse preferences
    user_preferences = DesignPreferences()
    if preferences:
        try:
            prefs_dict = json.loads(preferences)
            user_preferences = DesignPreferences(**prefs_dict)
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Invalid preferences JSON: {str(e)}"
            )

    # Analyze image
    try:
        analysis = await claude_service.analyze_inspiration_image(image_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to analyze image: {str(e)}"
        )

    # Generate CSS
    try:
        css = await claude_service.generate_css_from_analysis(
            analysis, user_preferences
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate CSS: {str(e)}"
        )

    # Build explanation
    explanation = f"Generated a {analysis.aesthetic} design with a {analysis.mood} mood. "
    explanation += f"The color palette includes {', '.join(analysis.colors[:3])}. "
    explanation += f"Layout style: {analysis.layout_style}."

    return CSSGenerationResponse(
        css=css,
        explanation=explanation,
        colors=analysis.colors,
    )


@router.post("/from-description", response_model=CSSGenerationResponse)
async def design_from_description(
    request: TextDesignRequest,
    claude_service: ClaudeService = Depends(get_claude_service),
):
    """
    Generate CSS from a text description.

    Args:
        request: TextDesignRequest with description and preferences

    Returns:
        CSSGenerationResponse with generated CSS and metadata
    """
    if not request.description or len(request.description.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="Description must be at least 10 characters long",
        )

    # Use default preferences if not provided
    preferences = request.preferences or DesignPreferences()

    # Generate CSS from description
    try:
        css, explanation = await claude_service.generate_css_from_description(
            request.description, preferences, request.current_css
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate CSS: {str(e)}"
        )

    # Extract colors from CSS (simple regex - in production, use proper parser)
    import re

    color_pattern = r"#[0-9A-Fa-f]{6}"
    colors = list(set(re.findall(color_pattern, css)))[:8]

    return CSSGenerationResponse(
        css=css,
        explanation=explanation,
        colors=colors if colors else ["#FF006E", "#8338EC", "#3A86FF"],
    )


@router.get("/health")
async def design_health():
    """Health check for design endpoints."""
    return {
        "status": "healthy",
        "endpoints": ["/design/from-image", "/design/from-description"],
    }
