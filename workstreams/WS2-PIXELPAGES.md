# Workstream 2: PixelPages (Profile System)

## Overview
The star feature of PixelBoxx - fully customizable profile pages that bring back MySpace-era self-expression with 2025 technology.

**Priority:** 🟡 HIGH - The core product differentiator.

---

## Task Breakdown

### 2.1 Profile Data Model & API
**Estimated effort:** 4-6 hours

- [ ] **2.1.1** Extend database schema:
```prisma
model PixelPage {
  id          String   @id @default(uuid())
  userId      String   @unique @map("user_id")
  customCss   String?  @map("custom_css") @db.Text
  layoutJson  Json?    @map("layout_json")
  bio         String?  @db.Text
  musicUrl    String?  @map("music_url") @db.VarChar(500)
  themeId     String?  @map("theme_id")
  isPublic    Boolean  @default(true) @map("is_public")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  theme       Theme?   @relation(fields: [themeId], references: [id])
  sections    PageSection[]
  guestbookEntries GuestbookEntry[]
  
  @@map("pixel_pages")
}

model PageSection {
  id          String   @id @default(uuid())
  pageId      String   @map("page_id")
  type        SectionType
  content     Json
  position    Int
  isVisible   Boolean  @default(true) @map("is_visible")
  
  page        PixelPage @relation(fields: [pageId], references: [id], onDelete: Cascade)
  
  @@map("page_sections")
}

enum SectionType {
  BIO
  TOP_FRIENDS
  MUSIC_PLAYER
  PHOTO_GALLERY
  GUESTBOOK
  CUSTOM_HTML
  WIDGET
}

model Theme {
  id          String   @id @default(uuid())
  creatorId   String   @map("creator_id")
  name        String   @db.VarChar(64)
  description String?  @db.Text
  css         String   @db.Text
  previewUrl  String?  @map("preview_url") @db.VarChar(500)
  isPublic    Boolean  @default(false) @map("is_public")
  useCount    Int      @default(0) @map("use_count")
  createdAt   DateTime @default(now()) @map("created_at")
  
  creator     User     @relation(fields: [creatorId], references: [id])
  pages       PixelPage[]
  
  @@map("themes")
}
```

- [ ] **2.1.2** Create PixelPages module in NestJS
- [ ] **2.1.3** API endpoints:
  - `GET /pages/:username` - View public profile
  - `GET /pages/me` - Get own profile for editing
  - `PUT /pages/me` - Update profile
  - `PUT /pages/me/css` - Update custom CSS only
  - `PUT /pages/me/sections` - Update section order/visibility
  - `POST /pages/me/sections` - Add new section
  - `DELETE /pages/me/sections/:id` - Remove section

**Deliverable:** CRUD operations for profiles working.

---

### 2.2 CSS Sanitization Engine 🔒
**Estimated effort:** 8-12 hours

This is CRITICAL for security. Users will input arbitrary CSS.

- [ ] **2.2.1** Research CSS sanitization approaches:
  - Whitelist allowed properties
  - Block dangerous patterns (expressions, urls to external scripts)
  - Prevent breaking out of sandbox
  
- [ ] **2.2.2** Create CSS parser and sanitizer:
```typescript
interface CssSanitizer {
  sanitize(css: string): SanitizeResult;
  validate(css: string): ValidationResult;
}

interface SanitizeResult {
  clean: string;        // Sanitized CSS
  removed: string[];    // What was stripped and why
  warnings: string[];   // Non-blocking issues
}
```

- [ ] **2.2.3** Whitelist of allowed CSS properties:
```typescript
const ALLOWED_PROPERTIES = [
  // Layout
  'display', 'position', 'top', 'right', 'bottom', 'left',
  'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
  'margin', 'margin-*', 'padding', 'padding-*',
  'flex', 'flex-*', 'grid', 'grid-*', 'gap',
  
  // Visual
  'background', 'background-*',
  'border', 'border-*', 'border-radius',
  'box-shadow', 'opacity',
  
  // Typography
  'color', 'font', 'font-*', 'text-*', 'line-height', 'letter-spacing',
  
  // Transform & Animation
  'transform', 'transition', 'animation', 'animation-*',
  '@keyframes', // Allow keyframe definitions
  
  // Other safe properties
  'cursor', 'overflow', 'z-index', 'filter',
];
```

- [ ] **2.2.4** Blocked patterns:
```typescript
const BLOCKED_PATTERNS = [
  /expression\s*\(/i,           // IE expression() exploit
  /javascript\s*:/i,            // javascript: URLs
  /behavior\s*:/i,              // IE behavior
  /@import/i,                   // External imports
  /url\s*\(\s*["']?data:/i,     // Data URLs (potential XSS)
  /<script/i,                   // Script tags
  /onclick|onerror|onload/i,    // Event handlers
];
```

- [ ] **2.2.5** URL sanitization for background-image, etc:
  - Only allow relative URLs or whitelisted domains
  - No external fonts (serve from our CDN)
  
- [ ] **2.2.6** CSS variable support (safe subset)
- [ ] **2.2.7** Test suite with known XSS vectors
- [ ] **2.2.8** Performance: cache sanitized CSS, don't re-sanitize on every view

**Deliverable:** Rock-solid CSS sanitization that blocks all known attack vectors.

---

### 2.3 Profile Sandbox Rendering
**Estimated effort:** 6-8 hours

How we safely render user CSS without affecting the main app.

- [ ] **2.3.1** Create sandboxed profile container:
```tsx
// Profile CSS only applies within this container
<div className="pixelpage-sandbox" data-username={username}>
  <style>{scopedCss}</style>
  {/* Profile content */}
</div>
```

- [ ] **2.3.2** CSS scoping strategy:
  - Prefix all user CSS selectors with `.pixelpage-sandbox[data-username="X"]`
  - Prevents CSS from leaking to other parts of the app
  
- [ ] **2.3.3** Shadow DOM alternative (more isolation, evaluate tradeoffs)
- [ ] **2.3.4** Profile layout renderer (parse layoutJson, render sections)
- [ ] **2.3.5** Section components:
  - BiоSection
  - TopFriendsSection
  - MusicPlayerSection
  - PhotoGallerySection
  - GuestbookSection
  - CustomHTMLSection (heavily sanitized)

**Deliverable:** User CSS renders safely in an isolated container.

---

### 2.4 Profile Editor UI
**Estimated effort:** 12-16 hours

The creation experience - where users build their PixelPage.

- [ ] **2.4.1** Editor layout:
```
┌─────────────────────────────────────────────────────────────┐
│  [Toolbar: Save | Preview | Theme | AI Assist | Settings]   │
├──────────────────────┬──────────────────────────────────────┤
│                      │                                      │
│   Section Editor     │          Live Preview                │
│   ├── Bio            │     (Shows profile as visitors       │
│   ├── Top Friends    │         would see it)                │
│   ├── Music          │                                      │
│   ├── Photos         │                                      │
│   ├── Guestbook      │                                      │
│   └── + Add Section  │                                      │
│                      │                                      │
├──────────────────────┴──────────────────────────────────────┤
│                    CSS Editor (Monaco)                       │
│   /* Your custom styles here */                              │
│   .profile-bio { color: #ff00ff; }                          │
└─────────────────────────────────────────────────────────────┘
```

- [ ] **2.4.2** Split-pane layout with resizable panels
- [ ] **2.4.3** Section editor sidebar:
  - Drag-and-drop reordering
  - Toggle visibility
  - Individual section settings
- [ ] **2.4.4** Monaco editor for CSS (syntax highlighting, autocomplete)
- [ ] **2.4.5** Live preview (debounced updates as user types)
- [ ] **2.4.6** Validation feedback (show sanitizer warnings inline)
- [ ] **2.4.7** Save/publish flow
- [ ] **2.4.8** Unsaved changes warning
- [ ] **2.4.9** Version history (optional but nice)

**Deliverable:** Full WYSIWYG-ish profile editor.

---

### 2.5 Template System
**Estimated effort:** 8-10 hours

Pre-built themes users can start from.

- [ ] **2.5.1** Template browser UI:
  - Grid of theme previews
  - Categories (Dark, Colorful, Minimal, Retro, Anime, etc.)
  - Search/filter
  
- [ ] **2.5.2** Template preview modal:
  - Large preview
  - "Use this template" button
  - Credit to creator
  
- [ ] **2.5.3** Template application:
  - Apply CSS to current profile
  - Option to merge or replace
  
- [ ] **2.5.4** Create 10-15 starter templates:
  - Pixel Art Classic
  - Neon Cyberpunk
  - Pastel Dreams
  - Dark Academia
  - Y2K Aesthetic
  - Cottagecore
  - Vaporwave
  - Grunge
  - Minimalist
  - Maximalist Chaos
  
- [ ] **2.5.5** Template metadata (colors, vibe tags, etc.)

**Deliverable:** Users can browse and apply templates.

---

### 2.6 Profile Sections Deep Dive
**Estimated effort:** 10-14 hours

Each section type needs its own editor and renderer.

#### 2.6.1 Bio Section
- [ ] Rich text editor (limited formatting)
- [ ] Emoji support
- [ ] Link detection

#### 2.6.2 Top Friends Section
- [ ] Friend selector (search your friends)
- [ ] Drag to rank (positions 1-8)
- [ ] Display options (grid, list, sizes)
- [ ] Hover effects

#### 2.6.3 Music Player Section
- [ ] URL input (YouTube, Spotify, SoundCloud embeds)
- [ ] Embed sanitization
- [ ] Autoplay toggle (default OFF for sanity)
- [ ] Visual customization

#### 2.6.4 Photo Gallery Section
- [ ] Image uploader (multiple)
- [ ] Layout options (grid, masonry, carousel)
- [ ] Captions
- [ ] Lightbox view

#### 2.6.5 Guestbook Section
- [ ] Display recent entries
- [ ] Styling options
- [ ] Moderation (hide/delete entries)

#### 2.6.6 Custom Widget Section
- [ ] Predefined widget types:
  - Now Playing (Spotify integration)
  - Currently Reading
  - Mood/Status
  - Mini blog feed
  - Social links

**Deliverable:** All section types fully functional.

---

### 2.7 Guestbook System
**Estimated effort:** 4-6 hours

Leave messages on people's profiles.

- [ ] **2.7.1** Guestbook entry model:
```prisma
model GuestbookEntry {
  id          String   @id @default(uuid())
  pageId      String   @map("page_id")
  authorId    String   @map("author_id")
  content     String   @db.Text
  createdAt   DateTime @default(now()) @map("created_at")
  isHidden    Boolean  @default(false) @map("is_hidden")
  
  page        PixelPage @relation(fields: [pageId], references: [id], onDelete: Cascade)
  author      User     @relation(fields: [authorId], references: [id])
  
  @@map("guestbook_entries")
}
```

- [ ] **2.7.2** API endpoints:
  - `GET /pages/:username/guestbook` - List entries
  - `POST /pages/:username/guestbook` - Leave entry
  - `DELETE /guestbook/:id` - Delete own entry
  - `PUT /guestbook/:id/hide` - Owner can hide entries

- [ ] **2.7.3** Guestbook UI component
- [ ] **2.7.4** Entry composer
- [ ] **2.7.5** Pagination
- [ ] **2.7.6** Abuse prevention (rate limiting, content filtering)

**Deliverable:** Visitors can leave and view guestbook entries.

---

### 2.8 Theme Marketplace
**Estimated effort:** 6-8 hours

Users can share their CSS as themes.

- [ ] **2.8.1** "Publish as Theme" flow:
  - Name your theme
  - Add description
  - Generate preview screenshot
  - Set public/private
  
- [ ] **2.8.2** Theme browser page:
  - Popular themes
  - New themes
  - Search by name/tags
  - Filter by category
  
- [ ] **2.8.3** Theme detail page:
  - Full preview
  - Use count
  - Creator profile link
  - "Use this theme" action
  
- [ ] **2.8.4** Theme analytics (views, uses)
- [ ] **2.8.5** Report theme (inappropriate content)

**Deliverable:** Theme sharing ecosystem.

---

### 2.9 Profile URL & Sharing
**Estimated effort:** 2-4 hours

- [ ] **2.9.1** Public profile URLs: `pixelboxx.com/@username`
- [ ] **2.9.2** OG meta tags for social sharing:
  - Dynamic OG image generation (screenshot of profile)
  - Title, description from profile
- [ ] **2.9.3** Share button with copy link
- [ ] **2.9.4** QR code generation

**Deliverable:** Profiles are shareable with nice previews.

---

## Dependencies

**Depends on WS1:**
- Authentication (who is editing)
- File uploads (profile images, gallery)
- Database setup

**Depends on WS5:**
- Design system components
- App shell (where editor lives)

---

## Acceptance Criteria

- [ ] User can create and edit their PixelPage
- [ ] Custom CSS applies safely without affecting other users
- [ ] All attack vectors (XSS, injection) are blocked
- [ ] Templates are available and easy to apply
- [ ] All section types work correctly
- [ ] Guestbook allows visitors to leave messages
- [ ] Profiles are viewable at public URLs
- [ ] Themes can be shared with the community

---

## Security Checklist

- [ ] CSS sanitization blocks all known XSS vectors
- [ ] No user input rendered without escaping
- [ ] URL validation for all external resources
- [ ] Rate limiting on profile saves
- [ ] Content moderation for public content
- [ ] Privacy controls respected

---

## Files to Create

```
apps/web/src/
├── app/
│   ├── @[username]/
│   │   └── page.tsx           # Public profile view
│   └── editor/
│       └── page.tsx           # Profile editor
├── components/
│   └── pixelpage/
│       ├── ProfileRenderer.tsx
│       ├── ProfileEditor.tsx
│       ├── CssEditor.tsx
│       ├── SectionEditor.tsx
│       ├── sections/
│       │   ├── BioSection.tsx
│       │   ├── TopFriendsSection.tsx
│       │   ├── MusicSection.tsx
│       │   ├── GallerySection.tsx
│       │   ├── GuestbookSection.tsx
│       │   └── WidgetSection.tsx
│       ├── templates/
│       │   ├── TemplateBrowser.tsx
│       │   └── TemplatePreview.tsx
│       └── guestbook/
│           ├── GuestbookList.tsx
│           └── GuestbookEntry.tsx
└── lib/
    └── css-sanitizer/
        ├── index.ts
        ├── parser.ts
        ├── sanitizer.ts
        └── test.ts

apps/api/src/
├── pixelpages/
│   ├── pixelpages.module.ts
│   ├── pixelpages.controller.ts
│   ├── pixelpages.service.ts
│   └── dto/
├── themes/
│   ├── themes.module.ts
│   ├── themes.controller.ts
│   └── themes.service.ts
└── guestbook/
    ├── guestbook.module.ts
    ├── guestbook.controller.ts
    └── guestbook.service.ts
```
