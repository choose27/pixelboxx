'use client';

import React, { useState, useEffect } from 'react';
import { ProfileRenderer } from '@/components/pixelpage/ProfileRenderer';
import { CssEditor } from '@/components/pixelpage/CssEditor';
import { pixelPagesApi } from '@/lib/api-client';

export default function EditorPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // This is a placeholder - in production, you'd get the auth token from a context/hook
  const authToken = 'YOUR_AUTH_TOKEN';

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // In production, this would use actual auth
      // const page = await pixelPagesApi.getOwnPage(authToken);

      // For now, we'll show a placeholder
      setProfile({
        username: 'demo',
        displayName: 'Demo User',
        pixelPage: {
          id: '1',
          customCss: '/* Add your custom CSS here */\n\n.profile-header {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n  padding: 2rem;\n  border-radius: 12px;\n  text-align: center;\n}\n\n.profile-bio {\n  background: white;\n  padding: 1.5rem;\n  border-radius: 8px;\n  margin: 1rem 0;\n  box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n}',
          bio: 'Welcome to my PixelPage! This is a demo profile.',
          isPublic: true,
          sections: [],
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCss = async (css: string) => {
    try {
      // In production:
      // const result = await pixelPagesApi.updateCss(authToken, css);

      // For now, just update local state
      setProfile({
        ...profile,
        pixelPage: {
          ...profile.pixelPage,
          customCss: css,
        },
      });
    } catch (err: any) {
      throw new Error(err.message || 'Failed to save CSS');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading Editor...</h2>
          <p className="text-gray-600">Please wait</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-red-600">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Editor Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile Editor</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              {previewMode ? 'Edit Mode' : 'Preview Mode'}
            </button>
            <a
              href={`/${profile.username}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Public Profile
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {previewMode ? (
          /* Preview Mode - Full Width */
          <div className="max-w-4xl mx-auto">
            <ProfileRenderer profile={profile} />
          </div>
        ) : (
          /* Edit Mode - Split Pane */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: CSS Editor */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <CssEditor
                initialCss={profile.pixelPage.customCss || ''}
                onSave={handleSaveCss}
              />
            </div>

            {/* Right: Live Preview */}
            <div className="bg-gray-50 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
              <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                <ProfileRenderer profile={profile} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="container mx-auto p-4 mt-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Tips:</h3>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>All CSS is automatically scoped to your profile to prevent conflicts</li>
            <li>Dangerous properties and patterns are automatically removed for security</li>
            <li>Use classes like <code>.profile-header</code>, <code>.profile-bio</code>, <code>.profile-section</code></li>
            <li>Changes are saved automatically and will appear on your public profile</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
