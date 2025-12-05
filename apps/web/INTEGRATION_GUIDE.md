# AI Design Assistant - Frontend Integration Guide

## How to Integrate the AI Design Assistant into Your Profile Editor

### Quick Start

The AI Design Assistant is ready to use! Just import and add it to any page where you want users to generate CSS.

### Example: Profile Editor Integration

```typescript
'use client';

import { useState } from 'react';
import { AIDesignAssistant } from '@/components/pixelpage/AIDesignAssistant';

export default function ProfileEditorPage() {
  const [css, setCss] = useState('');
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const handleApplyCSS = (generatedCss: string) => {
    setCss(generatedCss);
    // Optionally save to backend immediately
    // await pixelPagesApi.updateCSS(generatedCss);
  };

  return (
    <div>
      <h1>Edit Your Profile</h1>

      {/* Your existing CSS editor */}
      <textarea
        value={css}
        onChange={(e) => setCss(e.target.value)}
        className="w-full h-64 p-4 font-mono"
        placeholder="/* Your custom CSS */"
      />

      {/* AI Assist Button */}
      <button
        onClick={() => setShowAIAssistant(true)}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg"
      >
        AI Assist
      </button>

      {/* AI Design Assistant Modal */}
      {showAIAssistant && (
        <AIDesignAssistant
          onApplyCSS={handleApplyCSS}
          onClose={() => setShowAIAssistant(false)}
        />
      )}
    </div>
  );
}
```

### Component API

#### AIDesignAssistant Props

```typescript
interface AIDesignAssistantProps {
  onApplyCSS: (css: string) => void;  // Called when user applies generated CSS
  onClose: () => void;                 // Called when user closes the modal
}
```

### Using the API Client Directly

If you want to build a custom UI instead of using the modal:

```typescript
import { aiDesignApi, DesignPreferences } from '@/lib/api-client';

// Generate from image
const handleImageUpload = async (file: File) => {
  const preferences: DesignPreferences = {
    dark_mode: true,
    animation_level: 'medium',
    neon_intensity: 'high',
  };

  try {
    const result = await aiDesignApi.generateFromImage(file, preferences);
    console.log('Generated CSS:', result.css);
    console.log('Explanation:', result.explanation);
    console.log('Colors:', result.colors);
  } catch (error) {
    console.error('Failed to generate:', error);
  }
};

// Generate from description
const handleDescriptionSubmit = async (description: string) => {
  const preferences: DesignPreferences = {
    dark_mode: false,
    animation_level: 'low',
    high_contrast: true,
  };

  try {
    const result = await aiDesignApi.generateFromDescription(
      description,
      preferences
    );
    console.log('Generated CSS:', result.css);
  } catch (error) {
    console.error('Failed to generate:', error);
  }
};
```

### Design Preferences Options

```typescript
interface DesignPreferences {
  dark_mode?: boolean;                          // Default: true
  animation_level?: 'none' | 'low' | 'medium' | 'high';  // Default: 'medium'
  high_contrast?: boolean;                      // Default: false
  pixel_density?: 'minimal' | 'normal' | 'heavy';  // Default: 'normal'
  neon_intensity?: 'low' | 'medium' | 'high';   // Default: 'medium'
}
```

### Custom Integration Examples

#### Example 1: Template Generator

```typescript
import { aiDesignApi } from '@/lib/api-client';

export function TemplateGenerator() {
  const generateTemplate = async (themeName: string) => {
    const descriptions = {
      cyberpunk: 'Dark theme with neon purple and blue accents, cyberpunk aesthetic, lots of glow',
      vaporwave: 'Pastel pink and blue gradients, 80s vaporwave vibes, dreamy atmosphere',
      terminal: 'Black background with Matrix green text, retro terminal aesthetic',
      minimalist: 'Clean white background, black text, minimal brutalist design',
    };

    const result = await aiDesignApi.generateFromDescription(
      descriptions[themeName],
      { animation_level: 'medium' }
    );

    return result.css;
  };

  return (
    <div>
      <button onClick={() => generateTemplate('cyberpunk')}>
        Generate Cyberpunk Theme
      </button>
      <button onClick={() => generateTemplate('vaporwave')}>
        Generate Vaporwave Theme
      </button>
    </div>
  );
}
```

#### Example 2: Inspiration Gallery

```typescript
export function InspirationGallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const applyInspiration = async (imageUrl: string) => {
    // Fetch the image
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], 'inspiration.jpg', { type: 'image/jpeg' });

    // Generate CSS
    const result = await aiDesignApi.generateFromImage(file);

    // Apply to profile
    await pixelPagesApi.updateCSS(result.css);
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {inspirationImages.map((image) => (
        <div key={image.id} onClick={() => applyInspiration(image.url)}>
          <img src={image.url} alt={image.name} />
          <button>Use This Style</button>
        </div>
      ))}
    </div>
  );
}
```

#### Example 3: Quick Style Prompts

```typescript
export function QuickStyleButtons() {
  const quickStyles = [
    { label: 'Dark & Neon', prompt: 'Dark background with bright neon accents, high energy' },
    { label: 'Pastel Dream', prompt: 'Soft pastel colors, dreamy gradients, gentle aesthetic' },
    { label: 'Retro Terminal', prompt: 'Black and green like old computer terminals, monospace fonts' },
    { label: 'High Contrast', prompt: 'Black and white, maximum contrast, bold typography' },
  ];

  const applyQuickStyle = async (prompt: string) => {
    const result = await aiDesignApi.generateFromDescription(prompt);
    await pixelPagesApi.updateCSS(result.css);
  };

  return (
    <div className="flex gap-2">
      {quickStyles.map((style) => (
        <button
          key={style.label}
          onClick={() => applyQuickStyle(style.prompt)}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          {style.label}
        </button>
      ))}
    </div>
  );
}
```

### Error Handling

Always wrap API calls in try-catch blocks:

```typescript
try {
  const result = await aiDesignApi.generateFromImage(file, preferences);
  // Success
} catch (error) {
  if (error instanceof Error) {
    // Show user-friendly error message
    setError(error.message);
  }
}
```

Common errors:
- "Invalid file type" - User uploaded non-image file
- "Failed to generate design" - AI service error
- Network errors - Backend or AI service down

### Loading States

Show loading indicators during generation (it can take 5-15 seconds):

```typescript
const [loading, setLoading] = useState(false);

const generate = async () => {
  setLoading(true);
  try {
    const result = await aiDesignApi.generateFromImage(file);
    // Handle result
  } finally {
    setLoading(false);
  }
};

return (
  <button disabled={loading}>
    {loading ? 'Generating...' : 'Generate CSS'}
  </button>
);
```

### Best Practices

1. **Always validate images before uploading**
   ```typescript
   const validateImage = (file: File): boolean => {
     const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
     const maxSize = 10 * 1024 * 1024; // 10MB

     if (!validTypes.includes(file.type)) {
       alert('Please upload a valid image file');
       return false;
     }

     if (file.size > maxSize) {
       alert('Image must be less than 10MB');
       return false;
     }

     return true;
   };
   ```

2. **Provide helpful example prompts**
   - Show users what kinds of descriptions work well
   - Give concrete examples like "Dark with neon purple" not just "Make it cool"

3. **Preview before applying**
   - Always show generated CSS before applying to profile
   - Let users copy the CSS for manual editing
   - Show the color palette so users know what colors are used

4. **Handle edge cases**
   - No image selected
   - Empty description
   - Network failures
   - AI service timeouts

### Styling the Components

The components use Tailwind CSS with PixelBoxx brand colors:
- Purple: `bg-purple-600`, `text-purple-400`, `border-purple-500`
- Gray scale: `bg-gray-900`, `bg-gray-800`, `text-gray-300`
- Accents: Neon effects, glowing borders

Match these colors when integrating into your pages.

### Environment Setup

Make sure your `.env.local` has:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

This tells the API client where to send requests.

---

## Complete Example: Profile Editor with AI Assist

```typescript
'use client';

import { useState, useEffect } from 'react';
import { AIDesignAssistant } from '@/components/pixelpage/AIDesignAssistant';
import { pixelPagesApi } from '@/lib/api-client';

export default function ProfileEditor() {
  const [css, setCss] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleApplyAI = (generatedCss: string) => {
    setCss(generatedCss);
    setMessage('AI-generated CSS applied! Click Save to update your profile.');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await pixelPagesApi.updateCSS(css);
      setMessage('Profile saved successfully!');
    } catch (error) {
      setMessage('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Your Profile</h1>

      {/* CSS Editor */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Custom CSS</label>
        <textarea
          value={css}
          onChange={(e) => setCss(e.target.value)}
          className="w-full h-96 p-4 bg-gray-900 text-white font-mono rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
          placeholder="/* Write your custom CSS here, or use AI Assist to generate it! */"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowAI(true)}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          AI Assist
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save CSS'}
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg text-gray-300">
          {message}
        </div>
      )}

      {/* AI Design Assistant Modal */}
      {showAI && (
        <AIDesignAssistant
          onApplyCSS={handleApplyAI}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  );
}
```

---

That's it! The AI Design Assistant is ready to use. Just import the component and wire it up to your CSS editor. Users will love the magic of "show me what you want" instant design generation.
