'use client';

import React from 'react';

interface BioSectionProps {
  content: {
    bio?: string;
  };
}

export function BioSection({ content }: BioSectionProps) {
  return (
    <div className="profile-section profile-bio">
      <h2>About Me</h2>
      <div className="bio-content">
        {content.bio ? (
          <p>{content.bio}</p>
        ) : (
          <p className="text-gray-500">No bio yet...</p>
        )}
      </div>
    </div>
  );
}
