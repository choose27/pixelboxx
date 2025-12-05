# Workstream 4: AI Layer

## Overview
The intelligence that makes PixelBoxx magical - AI-assisted profile design and content moderation.

**Priority:** 🔵 HIGH - Key differentiator ("make it look like this").

---

## Task Breakdown

### 4.1 AI Service Architecture
**Estimated effort:** 4-6 hours

Separate service for AI features - keeps main API clean, allows independent scaling.

- [ ] **4.1.1** FastAPI service setup:
```
ai-service/
├── main.py
├── api/
│   ├── design.py      # Profile design endpoints
│   └── moderation.py  # Content moderation endpoints
├── services/
│   ├── claude.py      # Claude API wrapper
│   ├── vision.py      # Image analysis
│   └── css.py         # CSS generation
├── models/
│   └── schemas.py     # Pydantic models
└── utils/
    └── prompts.py     # Prompt templates
```

- [ ] **4.1.2** Environment configuration:
  - Claude API key
  - OpenAI API key (vision fallback)
  - Rate limiting
  - Request queuing

- [ ] **4.1.3** Internal API authentication (API key between services)
- [ ] **4.1.4** Health check and metrics endpoints

**Deliverable:** AI service running and accessible from main API.

---

### 4.2 Profile Design Assistant
**Estimated effort:** 12-16 hours

The star AI feature - "make my profile look like this."

- [ ] **4.2.1** Design from inspiration image:
```python
@router.post("/design/from-image")
async def design_from_image(
    inspiration: UploadFile,
    user_preferences: DesignPreferences,
    current_profile: Optional[str] = None  # Existing CSS to build on
):
    # 1. Analyze inspiration image with vision model
    # 2. Extract color palette, layout style, vibe
    # 3. Generate CSS that captures the essence
    # 4. Return CSS + explanation of choices
    pass
```

- [ ] **4.2.2** Design from text description:
```python
@router.post("/design/from-description")
async def design_from_description(
    description: str,  # "dark with neon purple accents, cyberpunk vibes"
    current_profile: Optional[str] = None
):
    # Generate CSS from natural language
    pass
```

- [ ] **4.2.3** Design prompts for Claude:
```python
DESIGN_SYSTEM_PROMPT = """
You are a creative web designer helping users customize their PixelBoxx profile.
Generate valid CSS that:
- Works within the PixelBoxx profile sandbox
- Uses CSS custom properties for easy tweaking
- Is creative and reflects the user's desired aesthetic
- Includes animations and effects where appropriate
- Is optimized for both desktop and mobile

Available selectors:
- .pixelpage - The main profile container
- .profile-header - Hero/banner area
- .profile-bio - About me section
- .top-friends - Friends display
- .music-player - Music widget
- .photo-gallery - Image grid
- .guestbook - Comments section

Output only valid CSS. Be creative and bold.
"""
```

- [ ] **4.2.4** Vision analysis for inspiration:
```python
async def analyze_inspiration(image: bytes) -> DesignAnalysis:
    """Extract design elements from inspiration image."""
    response = await claude.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {"type": "base64", "data": base64.b64encode(image)}
                },
                {
                    "type": "text",
                    "text": """Analyze this image as inspiration for a profile page design.
                    Extract:
                    - Color palette (hex codes)
                    - Overall aesthetic/vibe
                    - Layout style
                    - Typography suggestions
                    - Animation/effect ideas
                    - Mood/feeling
                    
                    Return as JSON."""
                }
            ]
        }]
    )
    return DesignAnalysis.parse(response.content)
```

- [ ] **4.2.5** CSS generation from analysis:
```python
async def generate_css(analysis: DesignAnalysis, preferences: DesignPreferences) -> str:
    """Generate CSS based on design analysis."""
    prompt = f"""
    Create CSS for a PixelBoxx profile with these characteristics:
    
    Color Palette: {analysis.colors}
    Aesthetic: {analysis.aesthetic}
    Layout: {analysis.layout}
    Mood: {analysis.mood}
    
    User preferences:
    - Dark mode: {preferences.dark_mode}
    - Animation level: {preferences.animation_level}
    - Accessibility: {preferences.high_contrast}
    
    Generate creative, valid CSS that captures this aesthetic.
    """
    # Generate with Claude...
```

- [ ] **4.2.6** Design refinement:
  - "Make it darker"
  - "Add more animation"
  - "Tone down the colors"
  - Iterative conversation with AI

- [ ] **4.2.7** CSS validation before returning:
  - Syntax check
  - Run through sanitizer
  - Test render (optional)

**Deliverable:** Users can upload inspiration and get CSS.

---

### 4.3 Smart Template Suggestions
**Estimated effort:** 4-6 hours

Recommend templates based on user taste.

- [ ] **4.3.1** Taste quiz on signup:
  - Show pairs of profile designs
  - "Which do you prefer?"
  - Build preference profile

- [ ] **4.3.2** Extract preferences from quiz:
  - Color temperature (warm/cool)
  - Density (minimal/busy)
  - Animation preference
  - Aesthetic tags

- [ ] **4.3.3** Template matching algorithm:
  - Score templates against preferences
  - Personalized recommendations
  - "Because you liked X, try Y"

- [ ] **4.3.4** Learn from behavior:
  - Track which templates users browse
  - Track which they apply
  - Improve recommendations

**Deliverable:** Personalized template suggestions.

---

### 4.4 Content Moderation Pipeline
**Estimated effort:** 10-14 hours

Keep the platform safe.

- [ ] **4.4.1** Moderation queue infrastructure:
```prisma
model ModerationQueue {
  id          String   @id @default(uuid())
  contentType ContentType
  contentId   String   @map("content_id")
  userId      String   @map("user_id")
  status      ModerationStatus @default(PENDING)
  aiScore     Float?   @map("ai_score")
  aiReason    String?  @map("ai_reason") @db.Text
  reviewerId  String?  @map("reviewer_id")
  reviewedAt  DateTime? @map("reviewed_at")
  createdAt   DateTime @default(now()) @map("created_at")
  
  @@map("moderation_queue")
}

enum ContentType {
  PROFILE_IMAGE
  GALLERY_IMAGE
  MESSAGE
  GUESTBOOK
  CUSTOM_EMOTE
}

enum ModerationStatus {
  PENDING
  APPROVED
  REJECTED
  ESCALATED
}
```

- [ ] **4.4.2** Image moderation (vision model):
```python
@router.post("/moderate/image")
async def moderate_image(image: UploadFile) -> ModerationResult:
    """Check image for inappropriate content."""
    response = await vision_model.analyze(
        image=image,
        checks=[
            "nudity",
            "violence",
            "hate_symbols",
            "drugs",
            "self_harm",
            "child_safety"
        ]
    )
    return ModerationResult(
        safe=response.is_safe,
        score=response.confidence,
        flags=response.detected_issues,
        action=determine_action(response)
    )
```

- [ ] **4.4.3** Text moderation:
```python
@router.post("/moderate/text")
async def moderate_text(content: str, context: str = None) -> ModerationResult:
    """Check text content for policy violations."""
    # Check against word lists
    # Run through Claude for nuanced analysis
    # Consider context (guestbook vs bio vs message)
    pass
```

- [ ] **4.4.4** CSS moderation:
  - Already handled by sanitizer
  - But check for hidden content attempts
  - Detect CSS that hides malicious content

- [ ] **4.4.5** Auto-moderation rules:
  - Auto-approve: High confidence safe
  - Auto-reject: Obvious violations
  - Queue for review: Uncertain cases

- [ ] **4.4.6** Moderation dashboard (for human reviewers):
  - Queue of items to review
  - Quick approve/reject actions
  - Escalation for edge cases
  - Bulk actions

- [ ] **4.4.7** User-facing actions:
  - Content removed notification
  - Warning system (1st, 2nd, ban)
  - Appeal process

**Deliverable:** Automatic content moderation with human review fallback.

---

### 4.5 Real-time Moderation Hooks
**Estimated effort:** 4-6 hours

Integrate moderation into content flows.

- [ ] **4.5.1** Profile image upload:
  - Moderate before making public
  - Hold pending if uncertain
  
- [ ] **4.5.2** Gallery uploads:
  - Same flow as profile images
  
- [ ] **4.5.3** Messages:
  - Real-time check on send
  - Very fast path for obvious safe content
  - Async deeper check, remove if bad
  
- [ ] **4.5.4** Guestbook entries:
  - Moderate before posting
  - Notify owner if blocked

- [ ] **4.5.5** Custom emotes:
  - Moderate before available to boxx

**Deliverable:** All user content passes through moderation.

---

### 4.6 Reporting System
**Estimated effort:** 4-6 hours

Let users flag content.

- [ ] **4.6.1** Report model:
```prisma
model Report {
  id          String   @id @default(uuid())
  reporterId  String   @map("reporter_id")
  contentType ContentType
  contentId   String   @map("content_id")
  reason      ReportReason
  details     String?  @db.Text
  status      ReportStatus @default(OPEN)
  resolution  String?  @db.Text
  resolvedById String? @map("resolved_by_id")
  createdAt   DateTime @default(now()) @map("created_at")
  resolvedAt  DateTime? @map("resolved_at")
  
  @@map("reports")
}

enum ReportReason {
  SPAM
  HARASSMENT
  INAPPROPRIATE_CONTENT
  HATE_SPEECH
  IMPERSONATION
  OTHER
}
```

- [ ] **4.6.2** Report submission UI
- [ ] **4.6.3** Report review in mod dashboard
- [ ] **4.6.4** Repeated reports trigger escalation

**Deliverable:** Community-powered moderation.

---

### 4.7 AI Design UI Integration
**Estimated effort:** 6-8 hours

Frontend for AI design features.

- [ ] **4.7.1** "AI Assist" button in profile editor
- [ ] **4.7.2** Inspiration upload modal:
  - Drag-and-drop image
  - Preview uploaded image
  - Loading state during generation
  - CSS preview before applying

- [ ] **4.7.3** Text description input:
  - Textarea for describing desired look
  - Example prompts as suggestions
  - Generate button

- [ ] **4.7.4** Refinement chat:
  - "Make it more blue"
  - "Less busy"
  - Iterative back-and-forth

- [ ] **4.7.5** Generated CSS preview:
  - Show before/after
  - Apply button
  - Edit manually button

**Deliverable:** Seamless AI design in editor.

---

### 4.8 Rate Limiting & Cost Management
**Estimated effort:** 2-4 hours

AI calls are expensive. Control usage.

- [ ] **4.8.1** Rate limits per user:
  - X designs per hour
  - Y designs per day
  - Higher limits for premium (future)

- [ ] **4.8.2** Request queuing:
  - Don't overload AI services
  - Fair queuing across users

- [ ] **4.8.3** Caching:
  - Cache common design patterns
  - Don't regenerate similar requests

- [ ] **4.8.4** Cost tracking:
  - Log API costs per request
  - Alert on unusual spending

**Deliverable:** Sustainable AI feature usage.

---

## Dependencies

**Depends on WS1:**
- Authentication (who is requesting)
- File storage (images)

**Depends on WS2:**
- CSS sanitizer (validate AI output)
- Profile structure (know what to generate)

---

## Acceptance Criteria

- [ ] Users can generate CSS from inspiration images
- [ ] Users can describe a design in text and get CSS
- [ ] Generated CSS passes sanitization
- [ ] All uploaded images are moderated
- [ ] Messages with violations are caught
- [ ] Users can report content
- [ ] Moderators have a review dashboard
- [ ] Rate limiting prevents abuse

---

## AI Model Selection

| Feature | Model | Why |
|---------|-------|-----|
| CSS Generation | Claude Sonnet 4.5 | Best at creative, coherent CSS |
| Image Analysis | Claude with Vision | Good understanding of design |
| Text Moderation | Claude Haiku (fast) | Speed + accuracy balance |
| Image Moderation | GPT-4 Vision or specialized | Mature content detection |

---

## Files to Create

```
ai-service/
├── main.py
├── requirements.txt
├── Dockerfile
├── api/
│   ├── __init__.py
│   ├── design.py
│   ├── moderation.py
│   └── health.py
├── services/
│   ├── __init__.py
│   ├── claude.py
│   ├── vision.py
│   ├── css_generator.py
│   ├── image_moderator.py
│   └── text_moderator.py
├── models/
│   ├── __init__.py
│   ├── design.py
│   └── moderation.py
├── prompts/
│   ├── __init__.py
│   ├── design_prompts.py
│   └── moderation_prompts.py
└── utils/
    ├── __init__.py
    └── rate_limiter.py

apps/api/src/
├── moderation/
│   ├── moderation.module.ts
│   ├── moderation.controller.ts
│   └── moderation.service.ts
└── reports/
    ├── reports.module.ts
    ├── reports.controller.ts
    └── reports.service.ts

apps/web/src/
├── components/
│   └── ai/
│       ├── DesignAssistant.tsx
│       ├── InspirationUploader.tsx
│       ├── DesignChat.tsx
│       └── GeneratedPreview.tsx
└── app/
    └── mod/
        └── page.tsx             # Moderation dashboard
```
