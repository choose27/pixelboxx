from typing import List, Optional
from pydantic import BaseModel, Field


class DesignPreferences(BaseModel):
    """User preferences for design generation."""
    dark_mode: bool = Field(default=True, description="Use dark theme")
    animation_level: str = Field(default="medium", description="Animation intensity: none, low, medium, high")
    high_contrast: bool = Field(default=False, description="Enable high contrast for accessibility")
    pixel_density: str = Field(default="normal", description="Pixel aesthetic density: minimal, normal, heavy")
    neon_intensity: str = Field(default="medium", description="Neon effect intensity: low, medium, high")


class DesignAnalysis(BaseModel):
    """Analysis results from inspiration image."""
    colors: List[str] = Field(description="Extracted color palette (hex codes)")
    aesthetic: str = Field(description="Overall aesthetic/vibe (e.g., cyberpunk, retro, minimalist)")
    mood: str = Field(description="Emotional mood (e.g., energetic, calm, mysterious)")
    layout_style: str = Field(description="Layout approach (e.g., centered, grid, asymmetric)")
    typography_suggestions: str = Field(description="Font style recommendations")
    animation_ideas: str = Field(description="Suggested animations and effects")


class ImageAnalysisRequest(BaseModel):
    """Request for analyzing an inspiration image."""
    preferences: Optional[DesignPreferences] = None


class TextDesignRequest(BaseModel):
    """Request for generating design from text description."""
    description: str = Field(description="Natural language description of desired design")
    preferences: Optional[DesignPreferences] = None
    current_css: Optional[str] = Field(default=None, description="Existing CSS to build upon")


class CSSGenerationRequest(BaseModel):
    """Request for CSS generation from analysis."""
    analysis: DesignAnalysis
    preferences: DesignPreferences
    current_css: Optional[str] = None


class CSSGenerationResponse(BaseModel):
    """Response containing generated CSS and metadata."""
    css: str = Field(description="Generated CSS code")
    explanation: str = Field(description="Human-readable explanation of design choices")
    colors: List[str] = Field(description="Primary colors used in the design")
    preview_url: Optional[str] = Field(default=None, description="Optional preview image URL")
