# PixelBoxx Web (Frontend)

Next.js 14 App Router frontend for PixelBoxx.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** TailwindCSS
- **State:** Zustand + React Query (to be added)
- **Real-time:** NATS WebSocket Client (to be added)
- **TypeScript:** Strict mode

## Current Implementation Status

### WS5: Frontend Shell ✅ COMPLETE
- ✅ Design system (tokens, colors, typography)
- ✅ Core component library (Button, FeatureCard, ParticleCanvas)
- ✅ Landing page with neon pixel design
- ✅ Responsive layouts
- ✅ Particle animation system
- ✅ Mouse tracking effects

### Features to Implement

#### WS2: PixelPages
- [ ] Profile viewer
- [ ] Profile editor with live preview
- [ ] CSS editor (Monaco)
- [ ] Template browser
- [ ] Guestbook component

#### WS3: Chat UI
- [ ] Boxx sidebar
- [ ] Channel list
- [ ] Message list (virtualized)
- [ ] Message composer
- [ ] Member sidebar

#### WS6: Social UI
- [ ] Friends list
- [ ] Top Friends editor (drag-and-drop)
- [ ] Notification bell & dropdown
- [ ] Activity feed

## Directory Structure

```
apps/web/
├── app/
│   ├── globals.css         # Global styles & design tokens
│   ├── layout.tsx          # Root layout with fonts
│   └── page.tsx            # Landing page
├── components/
│   └── ui/
│       ├── Button.tsx      # Primary & ghost button variants
│       ├── FeatureCard.tsx # Feature showcase cards
│       └── ParticleCanvas.tsx # Floating particle system
├── tailwind.config.ts      # Tailwind with PixelBoxx theme
├── tsconfig.json           # TypeScript strict mode
├── next.config.js          # Next.js configuration
└── package.json
```

## Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Design System

### Color Palette

- **Backgrounds:** void-black (#0a0a0f), deep-space (#12121a), cosmic-grey (#1a1a24)
- **Neon Accents:** pink (#ff2d95), cyan (#00f5ff), purple (#bf5fff), lime (#ccff00), gold (#ffaa00)
- **Text:** primary (#ffffff), secondary (#a0a0b8), muted (#606070)

### Typography

- **Display:** Archivo Black (headers, logo)
- **Body:** Outfit (main content)
- **Pixel:** Press Start 2P (accent text, footer)

### Components

#### Button
```tsx
<Button variant="primary" size="large">Click Me</Button>
<Button variant="ghost">Cancel</Button>
```

#### FeatureCard
```tsx
<FeatureCard
  icon="🎨"
  title="Feature Title"
  description="Feature description"
  accentColor="pink"
/>
```

#### ParticleCanvas
```tsx
<ParticleCanvas />
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:4222
```

## Notes

- All animations and effects from landing.html are working in Next.js
- Particle system responds to mouse movement
- Feature cards have mouse tracking glow effects
- Gradient orbs follow cursor with parallax effect
- Fully responsive design maintained
