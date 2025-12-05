'use client';

import { useState } from 'react';
import { DesignPreferences } from '@/lib/api-client';

interface DesignPreferencesFormProps {
  onChange: (preferences: DesignPreferences) => void;
  initialPreferences?: DesignPreferences;
}

export function DesignPreferencesForm({
  onChange,
  initialPreferences = {},
}: DesignPreferencesFormProps) {
  const [preferences, setPreferences] = useState<DesignPreferences>({
    dark_mode: initialPreferences.dark_mode ?? true,
    animation_level: initialPreferences.animation_level ?? 'medium',
    high_contrast: initialPreferences.high_contrast ?? false,
    pixel_density: initialPreferences.pixel_density ?? 'normal',
    neon_intensity: initialPreferences.neon_intensity ?? 'medium',
  });

  const updatePreference = <K extends keyof DesignPreferences>(
    key: K,
    value: DesignPreferences[K],
  ) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Design Preferences</h3>

      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-300">Dark Mode</label>
        <button
          onClick={() => updatePreference('dark_mode', !preferences.dark_mode)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            preferences.dark_mode ? 'bg-purple-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
              preferences.dark_mode ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Animation Level */}
      <div className="space-y-2">
        <label className="text-sm text-gray-300">Animation Level</label>
        <div className="grid grid-cols-4 gap-2">
          {(['none', 'low', 'medium', 'high'] as const).map((level) => (
            <button
              key={level}
              onClick={() => updatePreference('animation_level', level)}
              className={`px-3 py-2 rounded text-sm capitalize transition-colors ${
                preferences.animation_level === level
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Pixel Density */}
      <div className="space-y-2">
        <label className="text-sm text-gray-300">Pixel Density</label>
        <div className="grid grid-cols-3 gap-2">
          {(['minimal', 'normal', 'heavy'] as const).map((density) => (
            <button
              key={density}
              onClick={() => updatePreference('pixel_density', density)}
              className={`px-3 py-2 rounded text-sm capitalize transition-colors ${
                preferences.pixel_density === density
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {density}
            </button>
          ))}
        </div>
      </div>

      {/* Neon Intensity */}
      <div className="space-y-2">
        <label className="text-sm text-gray-300">Neon Intensity</label>
        <div className="grid grid-cols-3 gap-2">
          {(['low', 'medium', 'high'] as const).map((intensity) => (
            <button
              key={intensity}
              onClick={() => updatePreference('neon_intensity', intensity)}
              className={`px-3 py-2 rounded text-sm capitalize transition-colors ${
                preferences.neon_intensity === intensity
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {intensity}
            </button>
          ))}
        </div>
      </div>

      {/* High Contrast */}
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-300">High Contrast</label>
        <button
          onClick={() =>
            updatePreference('high_contrast', !preferences.high_contrast)
          }
          className={`relative w-12 h-6 rounded-full transition-colors ${
            preferences.high_contrast ? 'bg-purple-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
              preferences.high_contrast ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
