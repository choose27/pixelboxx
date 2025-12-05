'use client';

import React from 'react';

interface MusicPlayerSectionProps {
  content: {
    musicUrl?: string;
    title?: string;
  };
}

export function MusicPlayerSection({ content }: MusicPlayerSectionProps) {
  if (!content.musicUrl) {
    return (
      <div className="profile-section music-player">
        <h2>Music</h2>
        <p className="text-gray-500">No music added yet...</p>
      </div>
    );
  }

  // Extract video ID from YouTube URL
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  const youtubeId = getYouTubeId(content.musicUrl);

  return (
    <div className="profile-section music-player">
      <h2>{content.title || 'Now Playing'}</h2>
      {youtubeId ? (
        <div className="music-embed">
          <iframe
            width="100%"
            height="200"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="music-link">
          <a href={content.musicUrl} target="_blank" rel="noopener noreferrer">
            Listen on external site
          </a>
        </div>
      )}
    </div>
  );
}
