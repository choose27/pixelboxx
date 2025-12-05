'use client';

import React, { useState } from 'react';

interface CssEditorProps {
  initialCss: string;
  onSave: (css: string) => Promise<void>;
}

export function CssEditor({ initialCss, onSave }: CssEditorProps) {
  const [css, setCss] = useState(initialCss);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await onSave(css);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save CSS');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="css-editor">
      <div className="editor-header">
        <h3>Custom CSS</h3>
        <div className="editor-actions">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Saving...' : 'Save CSS'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          CSS saved successfully!
        </div>
      )}

      <textarea
        value={css}
        onChange={(e) => setCss(e.target.value)}
        className="css-textarea"
        placeholder="/* Write your custom CSS here */&#10;.profile-header {&#10;  background: linear-gradient(to right, #667eea, #764ba2);&#10;  color: white;&#10;  padding: 2rem;&#10;  border-radius: 8px;&#10;}"
        spellCheck={false}
      />

      <div className="editor-footer">
        <p className="text-sm text-gray-500">
          Your CSS will be automatically scoped to your profile and sanitized for security.
        </p>
      </div>
    </div>
  );
}
