'use client';

import React, { useState, useEffect } from 'react';
import { guestbookApi } from '@/lib/api-client';

interface GuestbookEntry {
  id: string;
  content: string;
  createdAt: string;
  author: {
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

interface GuestbookSectionProps {
  username: string;
}

export function GuestbookSection({ username }: GuestbookSectionProps) {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEntries();
  }, [username]);

  const loadEntries = async () => {
    try {
      const response = await guestbookApi.getEntries(username, 1, 10) as { entries: GuestbookEntry[] };
      setEntries(response.entries || []);
    } catch (error) {
      console.error('Failed to load guestbook entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.trim()) return;

    setSubmitting(true);
    try {
      // This would need actual auth token from context
      // For now, we'll show a login prompt
      alert('Please log in to leave a guestbook entry');
    } catch (error) {
      console.error('Failed to submit entry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-section guestbook">
        <h2>Guestbook</h2>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="profile-section guestbook">
      <h2>Guestbook</h2>

      {/* Entry form */}
      <form onSubmit={handleSubmit} className="guestbook-form">
        <textarea
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          placeholder="Leave a message..."
          maxLength={1000}
          rows={3}
          className="guestbook-textarea"
        />
        <button type="submit" disabled={submitting} className="guestbook-submit">
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </form>

      {/* Entries list */}
      <div className="guestbook-entries">
        {entries.length === 0 ? (
          <p className="text-gray-500">No entries yet. Be the first to sign!</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="guestbook-entry">
              <div className="entry-header">
                {entry.author.avatarUrl && (
                  <img
                    src={entry.author.avatarUrl}
                    alt={entry.author.username}
                    className="entry-avatar"
                  />
                )}
                <div>
                  <strong>{entry.author.displayName || entry.author.username}</strong>
                  <span className="entry-date">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="entry-content">{entry.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
