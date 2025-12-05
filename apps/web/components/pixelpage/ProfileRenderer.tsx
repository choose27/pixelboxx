'use client';

import React from 'react';
import { applyScopedCSS, getSandboxAttributes } from '@/lib/css-scoping';
import { BioSection } from './sections/BioSection';
import { GuestbookSection } from './sections/GuestbookSection';
import { MusicPlayerSection } from './sections/MusicPlayerSection';

interface PixelPage {
  id: string;
  customCss?: string | null;
  bio?: string | null;
  musicUrl?: string | null;
  isPublic: boolean;
  sections: PageSection[];
}

interface PageSection {
  id: string;
  type: 'BIO' | 'TOP_FRIENDS' | 'MUSIC_PLAYER' | 'PHOTO_GALLERY' | 'GUESTBOOK' | 'CUSTOM_HTML' | 'WIDGET';
  content: any;
  position: number;
  isVisible: boolean;
}

interface ProfileData {
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  pixelPage: PixelPage;
}

interface ProfileRendererProps {
  profile: ProfileData;
}

export function ProfileRenderer({ profile }: ProfileRendererProps) {
  const { username, displayName, avatarUrl, pixelPage } = profile;
  const sandboxAttrs = getSandboxAttributes(username);

  // Render section based on type
  const renderSection = (section: PageSection) => {
    switch (section.type) {
      case 'BIO':
        return <BioSection key={section.id} content={section.content} />;
      case 'MUSIC_PLAYER':
        return <MusicPlayerSection key={section.id} content={section.content} />;
      case 'GUESTBOOK':
        return <GuestbookSection key={section.id} username={username} />;
      case 'PHOTO_GALLERY':
        return (
          <div key={section.id} className="profile-section photo-gallery">
            <h2>Photo Gallery</h2>
            <p className="text-gray-500">Photo gallery coming soon...</p>
          </div>
        );
      case 'TOP_FRIENDS':
        return (
          <div key={section.id} className="profile-section top-friends">
            <h2>Top Friends</h2>
            <p className="text-gray-500">Top friends feature coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={sandboxAttrs.className}
      data-username={sandboxAttrs['data-username']}
    >
      {/* Inject scoped CSS */}
      {pixelPage.customCss && (
        <style dangerouslySetInnerHTML={{ __html: applyScopedCSS(username, pixelPage.customCss) }} />
      )}

      {/* Profile Header */}
      <div className="profile-header">
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt={displayName || username}
            className="profile-avatar"
          />
        )}
        <h1 className="profile-name">{displayName || username}</h1>
        <p className="profile-username">@{username}</p>
      </div>

      {/* Bio (if exists and not in sections) */}
      {pixelPage.bio && !pixelPage.sections.some(s => s.type === 'BIO') && (
        <div className="profile-bio">
          <p>{pixelPage.bio}</p>
        </div>
      )}

      {/* Render sections in order */}
      <div className="profile-sections">
        {pixelPage.sections
          .filter(section => section.isVisible)
          .sort((a, b) => a.position - b.position)
          .map(renderSection)}
      </div>
    </div>
  );
}
