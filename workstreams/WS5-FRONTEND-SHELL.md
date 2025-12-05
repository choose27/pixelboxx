# Workstream 5: Frontend Shell & Design System

## Overview
The pixel-perfect foundation that everything else plugs into. Design system, app shell, core components, and the distinctive PixelBoxx aesthetic.

**Priority:** 🟣 CRITICAL - Foundation for all frontend work.

---

## Design Philosophy

**PixelBoxx Aesthetic:**
- Pixel art meets modern web
- Nostalgic but not dated
- Playful but functional
- Dark mode first (with light option)
- Glowing accents, subtle animations
- Retro-futuristic vibes

**Inspiration:**
- MySpace customization energy
- Discord's dark UI polish
- Pixel art games (Celeste, Hyper Light Drifter)
- Vaporwave/synthwave aesthetics
- Early web nostalgia (but executed well)

---

## Task Breakdown

### 5.1 Design System Foundation
**Estimated effort:** 8-12 hours

- [ ] **5.1.1** Color palette:
```css
:root {
  /* Core palette */
  --pixel-bg-primary: #0a0a0f;
  --pixel-bg-secondary: #12121a;
  --pixel-bg-tertiary: #1a1a24;
  
  /* Text */
  --pixel-text-primary: #ffffff;
  --pixel-text-secondary: #a0a0b0;
  --pixel-text-muted: #606070;
  
  /* Accents */
  --pixel-accent-primary: #00ffaa;    /* Mint/cyan glow */
  --pixel-accent-secondary: #ff00aa;   /* Hot pink */
  --pixel-accent-tertiary: #ffaa00;    /* Warm gold */
  
  /* Semantic */
  --pixel-success: #00ff88;
  --pixel-warning: #ffaa00;
  --pixel-error: #ff4466;
  --pixel-info: #00aaff;
  
  /* Glow effects */
  --pixel-glow-primary: 0 0 20px rgba(0, 255, 170, 0.3);
  --pixel-glow-secondary: 0 0 20px rgba(255, 0, 170, 0.3);
  
  /* Borders */
  --pixel-border: 1px solid rgba(255, 255, 255, 0.1);
  --pixel-border-accent: 1px solid var(--pixel-accent-primary);
}
```

- [ ] **5.1.2** Typography system:
```css
:root {
  /* Font families */
  --font-display: 'Press Start 2P', monospace;  /* Pixel art headers */
  --font-heading: 'Space Grotesk', sans-serif;  /* Modern headings */
  --font-body: 'Inter', sans-serif;             /* Clean body text */
  --font-mono: 'JetBrains Mono', monospace;     /* Code/technical */
  
  /* Scale */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
}
```

- [ ] **5.1.3** Spacing scale:
```css
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
}
```

- [ ] **5.1.4** Border radius (pixelated feel):
```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

- [ ] **5.1.5** Animation tokens:
```css
:root {
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 350ms ease;
  
  /* Keyframes */
  @keyframes pixel-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  @keyframes pixel-glow {
    0%, 100% { box-shadow: var(--pixel-glow-primary); }
    50% { box-shadow: 0 0 30px rgba(0, 255, 170, 0.5); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
}
```

- [ ] **5.1.6** Tailwind config extension:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        pixel: {
          bg: { primary: '#0a0a0f', secondary: '#12121a', tertiary: '#1a1a24' },
          accent: { primary: '#00ffaa', secondary: '#ff00aa', tertiary: '#ffaa00' },
          // ... rest of palette
        }
      },
      fontFamily: {
        display: ['Press Start 2P', 'monospace'],
        heading: ['Space Grotesk', 'sans-serif'],
        // ...
      },
      animation: {
        'pixel-pulse': 'pixel-pulse 2s ease-in-out infinite',
        'pixel-glow': 'pixel-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      }
    }
  }
}
```

**Deliverable:** Complete design token system.

---

### 5.2 Core Component Library
**Estimated effort:** 12-16 hours

Build the atomic components everything else uses.

#### 5.2.1 Buttons
- [ ] Primary button (glowing accent)
- [ ] Secondary button (outlined)
- [ ] Ghost button (minimal)
- [ ] Icon button
- [ ] Button sizes (sm, md, lg)
- [ ] Loading state
- [ ] Disabled state

```tsx
// Example API
<Button variant="primary" size="md" loading={false}>
  Save Changes
</Button>
```

#### 5.2.2 Form Inputs
- [ ] Text input
- [ ] Textarea
- [ ] Select dropdown
- [ ] Checkbox
- [ ] Radio
- [ ] Toggle switch
- [ ] Input with icon
- [ ] Input with validation state

#### 5.2.3 Cards & Containers
- [ ] Card (standard container)
- [ ] GlowCard (with accent glow)
- [ ] Panel (sidebar-style)
- [ ] Modal base
- [ ] Dropdown menu

#### 5.2.4 Feedback
- [ ] Toast notifications
- [ ] Alert banners
- [ ] Loading spinner (pixel-style)
- [ ] Skeleton loaders
- [ ] Progress bar
- [ ] Badge/tag

#### 5.2.5 Navigation
- [ ] NavLink
- [ ] Tabs
- [ ] Breadcrumbs
- [ ] Pagination

#### 5.2.6 Data Display
- [ ] Avatar (with online indicator)
- [ ] User card (mini profile preview)
- [ ] Table (basic)
- [ ] List item
- [ ] Empty state

**Deliverable:** Comprehensive component library.

---

### 5.3 App Shell Structure
**Estimated effort:** 8-10 hours

The layout that wraps all pages.

- [ ] **5.3.1** Main layout structure:
```
┌──────────────────────────────────────────────────────────────────┐
│  Top Bar (logo, search, notifications, user menu)                │
├────────┬─────────────────────────────────────────────────────────┤
│        │                                                         │
│ Side   │                                                         │
│ Bar    │                    Main Content                         │
│        │                                                         │
│ • Home │                                                         │
│ • Profile                                                        │
│ • Boxxes│                                                        │
│ • DMs  │                                                         │
│ • Settings                                                       │
│        │                                                         │
└────────┴─────────────────────────────────────────────────────────┘
```

- [ ] **5.3.2** Top bar:
  - Logo (links to home)
  - Global search
  - Notification bell (with unread count)
  - User avatar dropdown (profile, settings, logout)

- [ ] **5.3.3** Sidebar:
  - Navigation links with icons
  - Active state indicator
  - Collapsible on mobile
  - Boxx quick-switch

- [ ] **5.3.4** Mobile responsive:
  - Bottom navigation on mobile
  - Hamburger menu
  - Full-screen modals instead of sidebars

- [ ] **5.3.5** Layout variants:
  - Standard (sidebar + content)
  - Full-width (profile viewing)
  - Chat layout (sidebar + channels + chat)
  - Editor layout (full-screen editor)

**Deliverable:** Working app shell with responsive layouts.

---

### 5.4 Animation System
**Estimated effort:** 4-6 hours

Micro-interactions that make it feel alive.

- [ ] **5.4.1** Page transitions:
  - Fade in on route change
  - Slide for modals
  - Scale for dropdowns

- [ ] **5.4.2** Hover effects:
  - Button lift
  - Card glow
  - Link underline reveal

- [ ] **5.4.3** Loading animations:
  - Pixel dots loading
  - Skeleton shimmer
  - Progress bar glow

- [ ] **5.4.4** Notification animations:
  - Toast slide in
  - Badge bounce
  - Bell shake on new

- [ ] **5.4.5** Scroll effects:
  - Fade in on scroll
  - Parallax backgrounds (optional)
  - Sticky header shadow

**Deliverable:** Cohesive animation system.

---

### 5.5 Theme System
**Estimated effort:** 4-6 hours

Dark mode first, but support alternatives.

- [ ] **5.5.1** Theme tokens (dark mode):
  - Already defined above as default

- [ ] **5.5.2** Light mode variant:
```css
[data-theme="light"] {
  --pixel-bg-primary: #f5f5f7;
  --pixel-bg-secondary: #ffffff;
  --pixel-text-primary: #1a1a24;
  /* ... */
}
```

- [ ] **5.5.3** Theme toggle component
- [ ] **5.5.4** System preference detection
- [ ] **5.5.5** Theme persistence (localStorage)

**Deliverable:** Dark/light theme switching.

---

### 5.6 Landing Page
**Estimated effort:** 6-8 hours

The first thing users see.

- [ ] **5.6.1** Hero section:
  - Tagline: "YOUR SPACE. YOUR RULES."
  - Animated pixel art elements
  - CTA buttons (Sign Up, Learn More)

- [ ] **5.6.2** Feature highlights:
  - PixelPages (customization)
  - Boxxes (community)
  - AI Design (magic)
  - Free personalization

- [ ] **5.6.3** Example profiles showcase:
  - Live mini-previews of cool profiles
  - "See what's possible"

- [ ] **5.6.4** Social proof:
  - User count (when applicable)
  - Testimonials (when applicable)

- [ ] **5.6.5** Footer:
  - Links (About, Terms, Privacy, Contact)
  - Social links
  - Copyright

**Deliverable:** Stunning landing page.

---

### 5.7 Error & Empty States
**Estimated effort:** 3-4 hours

Polish for edge cases.

- [ ] **5.7.1** 404 page (pixel art themed)
- [ ] **5.7.2** 500 error page
- [ ] **5.7.3** Empty states for:
  - No boxxes joined
  - No messages
  - No friends
  - No photos
  - Search with no results

- [ ] **5.7.4** Offline indicator
- [ ] **5.7.5** Maintenance page

**Deliverable:** Graceful error handling.

---

### 5.8 Accessibility
**Estimated effort:** 4-6 hours

Make it usable for everyone.

- [ ] **5.8.1** Keyboard navigation:
  - Tab order
  - Focus indicators (visible, styled)
  - Skip links

- [ ] **5.8.2** Screen reader support:
  - ARIA labels
  - Semantic HTML
  - Announcements for dynamic content

- [ ] **5.8.3** Color contrast:
  - Meet WCAG AA minimum
  - High contrast mode option

- [ ] **5.8.4** Reduced motion:
  - Respect prefers-reduced-motion
  - Simpler animations when enabled

- [ ] **5.8.5** Focus management:
  - Modal focus trap
  - Return focus on close

**Deliverable:** WCAG AA compliant.

---

## Dependencies

**No blockers** - This is foundational.

Other workstreams depend on this for:
- Components
- Layouts
- Design tokens
- Animation utilities

---

## Acceptance Criteria

- [ ] Design tokens defined and documented
- [ ] All core components built and working
- [ ] App shell responsive across devices
- [ ] Animations feel smooth and purposeful
- [ ] Dark/light theme works
- [ ] Landing page looks amazing
- [ ] Error states are handled gracefully
- [ ] Accessibility requirements met

---

## Files to Create

```
apps/web/src/
├── styles/
│   ├── globals.css         # Global styles, CSS variables
│   ├── tokens.css          # Design tokens
│   └── animations.css      # Keyframe definitions
├── components/
│   ├── ui/                 # Core components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Tabs.tsx
│   │   ├── Skeleton.tsx
│   │   └── index.ts        # Barrel export
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── TopBar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   └── Footer.tsx
│   └── shared/
│       ├── Logo.tsx
│       ├── ThemeToggle.tsx
│       └── EmptyState.tsx
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   ├── not-found.tsx       # 404
│   └── error.tsx           # Error boundary
├── hooks/
│   ├── useTheme.ts
│   └── useMediaQuery.ts
└── lib/
    └── cn.ts               # className utility

packages/ui/                 # Shared UI package (if using monorepo)
├── src/
│   └── ... (same structure)
└── package.json
```

---

## Design References

To be added:
- [ ] Figma link (if available)
- [ ] Mood board
- [ ] Component screenshots
- [ ] Animation examples

---

## Notes for Agents

1. **Pixel-perfect** - Sweat the details. 1px matters.
2. **Performance** - Components should be lightweight. No bloat.
3. **Consistency** - Use design tokens everywhere. No magic numbers.
4. **Accessibility** - Not an afterthought. Build it in from the start.
5. **Documentation** - Storybook or similar for component docs.
