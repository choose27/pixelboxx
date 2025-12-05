"""
Claude API wrapper for PixelBoxx AI features.
"""

import os
import json
import base64
from typing import Dict, Optional
from anthropic import Anthropic
from models.design import DesignAnalysis, DesignPreferences
from prompts.design_prompts import (
    DESIGN_SYSTEM_PROMPT,
    IMAGE_ANALYSIS_PROMPT,
    CSS_GENERATION_PROMPT,
)


class ClaudeService:
    """Wrapper for Claude API interactions."""

    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        self.mock_mode = os.getenv("ENABLE_MOCK_RESPONSES", "true").lower() == "true"

        if not api_key and not self.mock_mode:
            raise ValueError("ANTHROPIC_API_KEY environment variable not set")

        self.client = Anthropic(api_key=api_key) if api_key else None
        self.model = "claude-sonnet-4-5-20250929"

    async def analyze_inspiration_image(self, image_bytes: bytes) -> DesignAnalysis:
        """
        Analyze an inspiration image and extract design elements.

        Args:
            image_bytes: Raw image data

        Returns:
            DesignAnalysis with extracted design elements
        """
        if self.mock_mode or not self.client:
            return self._mock_image_analysis()

        try:
            # Encode image to base64
            image_base64 = base64.b64encode(image_bytes).decode("utf-8")

            # Determine image type (default to jpeg)
            image_type = "image/jpeg"
            if image_bytes.startswith(b'\x89PNG'):
                image_type = "image/png"
            elif image_bytes.startswith(b'GIF'):
                image_type = "image/gif"
            elif image_bytes.startswith(b'\xff\xd8'):
                image_type = "image/jpeg"

            # Call Claude with vision
            response = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": image_type,
                                    "data": image_base64,
                                },
                            },
                            {
                                "type": "text",
                                "text": IMAGE_ANALYSIS_PROMPT,
                            },
                        ],
                    }
                ],
            )

            # Parse JSON response
            analysis_text = response.content[0].text
            analysis_data = json.loads(analysis_text)

            return DesignAnalysis(**analysis_data)

        except Exception as e:
            print(f"Error analyzing image: {e}")
            # Fallback to mock response on error
            return self._mock_image_analysis()

    async def generate_css_from_analysis(
        self,
        analysis: DesignAnalysis,
        preferences: DesignPreferences,
        current_css: Optional[str] = None,
    ) -> str:
        """
        Generate CSS based on design analysis and user preferences.

        Args:
            analysis: Design analysis from image or description
            preferences: User design preferences
            current_css: Optional existing CSS to build upon

        Returns:
            Generated CSS string
        """
        if self.mock_mode or not self.client:
            return self._mock_css_generation(analysis, preferences)

        try:
            # Build the prompt
            prompt = CSS_GENERATION_PROMPT.format(
                analysis=analysis.model_dump_json(indent=2),
                preferences=preferences.model_dump_json(indent=2),
            )

            if current_css:
                prompt += f"\n\nCurrent CSS to build upon:\n{current_css}"

            # Call Claude for CSS generation
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=DESIGN_SYSTEM_PROMPT,
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
            )

            css = response.content[0].text

            # Clean up the CSS (remove markdown code blocks if present)
            css = self._clean_css(css)

            return css

        except Exception as e:
            print(f"Error generating CSS: {e}")
            return self._mock_css_generation(analysis, preferences)

    async def generate_css_from_description(
        self,
        description: str,
        preferences: DesignPreferences,
        current_css: Optional[str] = None,
    ) -> tuple[str, str]:
        """
        Generate CSS from a text description.

        Args:
            description: Natural language description of desired design
            preferences: User design preferences
            current_css: Optional existing CSS to build upon

        Returns:
            Tuple of (generated CSS, explanation)
        """
        if self.mock_mode or not self.client:
            return self._mock_css_from_description(description, preferences)

        try:
            prompt = f"""Generate CSS for a PixelBoxx profile based on this description:

"{description}"

User Preferences:
{preferences.model_dump_json(indent=2)}

{f'Current CSS to build upon:{current_css}' if current_css else ''}

First, briefly explain your design choices in 2-3 sentences.
Then output the CSS code.

Format:
EXPLANATION: [your explanation]
CSS:
[css code]
"""

            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=DESIGN_SYSTEM_PROMPT,
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
            )

            content = response.content[0].text

            # Parse explanation and CSS
            explanation, css = self._parse_explanation_and_css(content)

            return css, explanation

        except Exception as e:
            print(f"Error generating CSS from description: {e}")
            return self._mock_css_from_description(description, preferences)

    def _clean_css(self, css: str) -> str:
        """Remove markdown code blocks and clean CSS."""
        # Remove markdown code blocks
        if "```css" in css:
            css = css.split("```css")[1].split("```")[0]
        elif "```" in css:
            css = css.split("```")[1].split("```")[0]

        return css.strip()

    def _parse_explanation_and_css(self, content: str) -> tuple[str, str]:
        """Parse explanation and CSS from combined response."""
        if "EXPLANATION:" in content and "CSS:" in content:
            parts = content.split("CSS:")
            explanation = parts[0].replace("EXPLANATION:", "").strip()
            css = self._clean_css(parts[1])
        else:
            # If format not followed, treat everything as CSS
            explanation = "Generated custom CSS based on your description."
            css = self._clean_css(content)

        return explanation, css

    # Mock responses for development/testing

    def _mock_image_analysis(self) -> DesignAnalysis:
        """Mock image analysis response."""
        return DesignAnalysis(
            colors=["#FF006E", "#8338EC", "#3A86FF", "#FB5607", "#FFBE0B"],
            aesthetic="vibrant cyberpunk with neon accents",
            mood="energetic and futuristic",
            layout_style="centered with dynamic asymmetric elements",
            typography_suggestions="bold geometric sans-serif with glowing effects",
            animation_ideas="subtle pulsing glows, smooth hover transitions, floating elements",
        )

    def _mock_css_generation(
        self, analysis: DesignAnalysis, preferences: DesignPreferences
    ) -> str:
        """Mock CSS generation response."""
        primary = analysis.colors[0] if analysis.colors else "#FF006E"
        secondary = analysis.colors[1] if len(analysis.colors) > 1 else "#8338EC"
        accent = analysis.colors[2] if len(analysis.colors) > 2 else "#3A86FF"

        animation_keyframes = ""
        if preferences.animation_level != "none":
            animation_keyframes = """
@keyframes glow-pulse {
  0%, 100% { filter: drop-shadow(0 0 8px var(--glow-color)); }
  50% { filter: drop-shadow(0 0 16px var(--glow-color)); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
"""

        return f"""/* PixelBoxx Profile - {analysis.aesthetic} */
:root {{
  --primary-color: {primary};
  --secondary-color: {secondary};
  --accent-color: {accent};
  --glow-color: {primary};
  --bg-dark: #0a0e27;
  --text-light: #ffffff;
  --border-width: 4px;
  --pixel-size: 8px;
}}

.pixelpage {{
  background: linear-gradient(135deg, var(--bg-dark) 0%, #1a1f3a 100%);
  color: var(--text-light);
  font-family: 'Courier New', monospace;
  padding: var(--pixel-size);
  image-rendering: pixelated;
}}

.profile-header {{
  background: linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  padding: calc(var(--pixel-size) * 4);
  position: relative;
  box-shadow:
    0 0 0 var(--border-width) var(--accent-color),
    0 var(--pixel-size) 0 var(--border-width) rgba(0,0,0,0.3);
  text-align: center;
  {f'animation: glow-pulse 3s ease-in-out infinite;' if preferences.animation_level == 'high' else ''}
}}

.profile-avatar {{
  border: var(--border-width) solid var(--accent-color);
  box-shadow:
    0 0 20px var(--glow-color),
    inset 0 0 20px rgba(0,0,0,0.3);
  image-rendering: pixelated;
  border-radius: 0;
}}

.profile-bio {{
  background: rgba(0, 0, 0, 0.6);
  border: var(--border-width) solid var(--primary-color);
  padding: calc(var(--pixel-size) * 3);
  margin: calc(var(--pixel-size) * 2) 0;
  box-shadow:
    0 0 0 2px var(--accent-color),
    0 var(--pixel-size) 20px rgba(0,0,0,0.5);
  line-height: 1.6;
}}

.top-friends {{
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--pixel-size);
  margin: calc(var(--pixel-size) * 2) 0;
}}

.top-friends-item {{
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid var(--secondary-color);
  padding: var(--pixel-size);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}}

.top-friends-item:hover {{
  transform: translateY(-4px);
  box-shadow:
    0 0 20px var(--secondary-color),
    0 var(--pixel-size) 0 var(--secondary-color);
}}

.photo-gallery {{
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: calc(var(--pixel-size) * 2);
  margin: calc(var(--pixel-size) * 2) 0;
}}

.photo-gallery-item {{
  border: var(--border-width) solid var(--accent-color);
  box-shadow: 0 0 15px rgba(0,0,0,0.5);
  transition: transform 0.3s ease;
  image-rendering: pixelated;
}}

.photo-gallery-item:hover {{
  transform: scale(1.05);
  box-shadow: 0 0 25px var(--glow-color);
}}

.guestbook {{
  background: rgba(0, 0, 0, 0.5);
  border: var(--border-width) solid var(--primary-color);
  padding: calc(var(--pixel-size) * 2);
  margin: calc(var(--pixel-size) * 2) 0;
}}

.guestbook-entry {{
  background: rgba(255, 255, 255, 0.05);
  border-left: 4px solid var(--accent-color);
  padding: var(--pixel-size);
  margin: var(--pixel-size) 0;
}}

.music-player {{
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  border: var(--border-width) solid var(--accent-color);
  padding: calc(var(--pixel-size) * 2);
  text-align: center;
  box-shadow:
    0 0 30px var(--glow-color),
    inset 0 0 20px rgba(0,0,0,0.3);
}}

{animation_keyframes}

@media (max-width: 768px) {{
  .pixelpage {{
    padding: calc(var(--pixel-size) / 2);
  }}

  .top-friends {{
    grid-template-columns: repeat(2, 1fr);
  }}

  .photo-gallery {{
    grid-template-columns: repeat(2, 1fr);
  }}
}}
"""

    def _mock_css_from_description(
        self, description: str, preferences: DesignPreferences
    ) -> tuple[str, str]:
        """Mock CSS generation from description."""
        explanation = f"Created a design inspired by your description: '{description[:100]}...'. The design uses a pixel art aesthetic with neon accents and smooth animations."

        # Use mock analysis with description-inspired tweaks
        mock_analysis = self._mock_image_analysis()
        css = self._mock_css_generation(mock_analysis, preferences)

        return css, explanation
