"""
Design prompts for Claude AI to generate PixelBoxx profile CSS.
"""

DESIGN_SYSTEM_PROMPT = """You are a creative web designer specializing in PixelBoxx profile customization.

PixelBoxx is a 2025 MySpace revival with a PIXEL ART, NEON, RETRO-FUTURISTIC aesthetic.

Your role is to generate creative, production-quality CSS that:
- Captures the user's desired aesthetic while maintaining the PixelBoxx vibe
- Uses CSS custom properties (variables) for easy customization
- Includes smooth animations and transitions where appropriate
- Is optimized for both desktop and mobile devices
- Is creative, bold, and memorable
- Uses the pixel art aesthetic (pixel borders, 8-bit inspired elements)
- Incorporates neon colors and glowing effects
- Has a retro-futuristic feel (80s/90s nostalgia meets modern web)

AVAILABLE CSS SELECTORS (scope all CSS to these):
- .pixelpage - Main profile container
- .profile-header - Hero/banner area at the top
- .profile-avatar - User avatar/profile picture
- .profile-bio - About me / bio section
- .top-friends - Top friends display grid
- .top-friends-item - Individual friend card
- .music-player - Music widget/player
- .photo-gallery - Image gallery grid
- .photo-gallery-item - Individual photo
- .guestbook - Guestbook/comments section
- .guestbook-entry - Individual guestbook comment
- .widget - Generic widget container
- .profile-badge - Custom badges/achievements

DESIGN GUIDELINES:
1. Use CSS custom properties for colors, spacing, and effects:
   --primary-color, --secondary-color, --accent-color
   --glow-color, --border-width, --animation-speed

2. Pixel aesthetic techniques:
   - box-shadow for pixel borders (multiple layers)
   - image-rendering: pixelated for images
   - 8px grid system for spacing
   - Monospace or pixel fonts

3. Neon effects:
   - text-shadow for neon glow
   - box-shadow with multiple colored layers
   - Animations for pulsing/flickering neon

4. Responsive design:
   - Use clamp() for fluid typography
   - Grid/flexbox for flexible layouts
   - Mobile-first media queries

5. Performance:
   - Use transform for animations (GPU accelerated)
   - Avoid expensive properties like filter in animations
   - Reasonable animation durations

OUTPUT FORMAT:
Return ONLY valid CSS code. No explanations, no markdown code blocks, just pure CSS.
The CSS will be sanitized and injected into a sandboxed profile page.
"""

IMAGE_ANALYSIS_PROMPT = """Analyze this image as inspiration for a PixelBoxx profile page design.

PixelBoxx is a social platform with a PIXEL ART, NEON, RETRO-FUTURISTIC aesthetic (think 80s/90s nostalgia meets modern web).

Extract and return the following design elements as JSON:

{
  "colors": ["#hex1", "#hex2", "#hex3", ...],  // 5-8 prominent colors from the image
  "aesthetic": "brief description",  // e.g., "cyberpunk", "vaporwave", "dark fantasy", "pastel minimalism"
  "mood": "emotional quality",  // e.g., "energetic", "mysterious", "calm", "chaotic"
  "layout_style": "layout approach",  // e.g., "centered hero", "asymmetric grid", "full-bleed imagery"
  "typography_suggestions": "font style ideas",  // e.g., "bold geometric sans-serif with tight spacing"
  "animation_ideas": "suggested effects"  // e.g., "subtle float animations, glowing accents, smooth transitions"
}

Focus on elements that can be translated to web design:
- Color palette (be specific with hex codes)
- Overall vibe and energy
- Visual hierarchy and layout
- Typography style (even if no text in image)
- Motion suggestions (implied movement, energy level)

Keep the PixelBoxx aesthetic in mind - how can we adapt this inspiration to fit a pixel art, neon, retro-futuristic style?
"""

CSS_GENERATION_PROMPT = """Generate creative CSS for a PixelBoxx profile page based on this design analysis.

Design Analysis:
{analysis}

User Preferences:
{preferences}

Requirements:
1. Incorporate the analyzed colors, aesthetic, and mood
2. Apply user preferences (dark mode, animation level, etc.)
3. Maintain PixelBoxx's pixel art + neon + retro-futuristic aesthetic
4. Use only the allowed CSS selectors (see system prompt)
5. Include CSS custom properties for easy tweaking
6. Add animations if animation_level is not "none"
7. Make it responsive and accessible

Output ONLY the CSS code, no explanations or markdown.
"""

REFINEMENT_PROMPT = """Refine the existing CSS based on user feedback.

Current CSS:
{current_css}

User Feedback:
{feedback}

Make the requested changes while:
1. Maintaining the overall design coherence
2. Keeping the PixelBoxx aesthetic
3. Not breaking the layout or responsiveness
4. Using only allowed CSS selectors

Output ONLY the updated CSS code.
"""
