'use client';

import { useState, useCallback } from 'react';
import { aiDesignApi, DesignPreferences, DesignResult } from '@/lib/api-client';
import { DesignPreferencesForm } from './DesignPreferencesForm';

interface AIDesignAssistantProps {
  onApplyCSS: (css: string) => void;
  onClose: () => void;
}

type Tab = 'image' | 'description';

export function AIDesignAssistant({
  onApplyCSS,
  onClose,
}: AIDesignAssistantProps) {
  const [activeTab, setActiveTab] = useState<Tab>('image');
  const [preferences, setPreferences] = useState<DesignPreferences>({
    dark_mode: true,
    animation_level: 'medium',
    neon_intensity: 'medium',
  });

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Description state
  const [description, setDescription] = useState('');

  // Generation state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DesignResult | null>(null);

  // Handle image selection
  const handleImageSelect = useCallback((file: File) => {
    setSelectedImage(file);
    setError(null);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle file drop
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleImageSelect(file);
      }
    },
    [handleImageSelect],
  );

  // Handle file input
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleImageSelect(file);
      }
    },
    [handleImageSelect],
  );

  // Generate CSS from image
  const generateFromImage = async () => {
    if (!selectedImage) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await aiDesignApi.generateFromImage(
        selectedImage,
        preferences,
      );
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate design');
    } finally {
      setLoading(false);
    }
  };

  // Generate CSS from description
  const generateFromDescription = async () => {
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await aiDesignApi.generateFromDescription(
        description,
        preferences,
      );
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate design');
    } finally {
      setLoading(false);
    }
  };

  // Apply generated CSS
  const handleApply = () => {
    if (result) {
      onApplyCSS(result.css);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">AI Design Assistant</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'image'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            From Image
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'description'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            From Description
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Input */}
            <div className="space-y-6">
              {activeTab === 'image' ? (
                <>
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Inspiration Image
                    </label>
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer"
                      onClick={() => document.getElementById('image-input')?.click()}
                    >
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded"
                          />
                          <p className="text-sm text-gray-400">
                            Click to change or drag a new image
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="text-gray-400">
                            Drag and drop an image, or click to browse
                          </p>
                        </div>
                      )}
                      <input
                        id="image-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Description Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Describe Your Desired Design
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Dark theme with neon purple accents, cyberpunk vibes, lots of glow effects, retro-futuristic aesthetic..."
                      className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      <p className="font-medium mb-1">Example prompts:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Dark with neon pink and blue accents, vaporwave aesthetic</li>
                        <li>Minimal black and white, high contrast, brutalist design</li>
                        <li>Pastel colors, soft gradients, dreamy fairy kei vibes</li>
                        <li>Matrix green on black, retro terminal look</li>
                      </ul>
                    </div>
                  </div>
                </>
              )}

              {/* Preferences */}
              <DesignPreferencesForm
                onChange={setPreferences}
                initialPreferences={preferences}
              />

              {/* Generate Button */}
              <button
                onClick={activeTab === 'image' ? generateFromImage : generateFromDescription}
                disabled={loading}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Generating...' : 'Generate CSS'}
              </button>

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Generated CSS Preview
                </label>
                {result ? (
                  <div className="space-y-4">
                    {/* Explanation */}
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-300">{result.explanation}</p>
                    </div>

                    {/* Color Palette */}
                    {result.colors && result.colors.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Color Palette:</p>
                        <div className="flex gap-2">
                          {result.colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-10 h-10 rounded"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CSS Code */}
                    <div className="relative">
                      <pre className="p-4 bg-gray-950 rounded-lg text-xs text-gray-300 overflow-x-auto max-h-96">
                        {result.css}
                      </pre>
                      <button
                        onClick={() => navigator.clipboard.writeText(result.css)}
                        className="absolute top-2 right-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                      >
                        Copy
                      </button>
                    </div>

                    {/* Apply Button */}
                    <button
                      onClick={handleApply}
                      className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Apply to Profile
                    </button>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center bg-gray-800 rounded-lg text-gray-500">
                    {loading ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
                        <p>Generating your design...</p>
                      </div>
                    ) : (
                      <p>Your generated CSS will appear here</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
