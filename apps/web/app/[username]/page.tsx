import { notFound } from 'next/navigation';
import { ProfileRenderer } from '@/components/pixelpage/ProfileRenderer';
import { pixelPagesApi } from '@/lib/api-client';

interface PageProps {
  params: {
    username: string;
  };
}

interface ProfileApiResponse {
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  pixelPage?: any;
}

interface ProfileData {
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  pixelPage: {
    id: string;
    customCss: string | null;
    bio: string | null;
    musicUrl: string | null;
    isPublic: boolean;
    sections: any[];
  };
}

async function getProfile(username: string): Promise<ProfileData | null> {
  try {
    const data = await pixelPagesApi.getByUsername(username) as ProfileApiResponse;

    // If pixelPage doesn't exist yet, create a default one
    if (!data.pixelPage) {
      data.pixelPage = {
        id: 'default',
        customCss: null,
        bio: null,
        musicUrl: null,
        isPublic: true,
        sections: [],
      };
    }

    return data as ProfileData;
  } catch (error: any) {
    if (error.status === 404 || error.status === 403) {
      return null;
    }
    throw error;
  }
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = params;
  const profile = await getProfile(username);

  if (!profile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ProfileRenderer profile={profile} />
      </div>
    </main>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { username } = params;
  const profile = await getProfile(username);

  if (!profile) {
    return {
      title: 'Profile Not Found',
    };
  }

  return {
    title: `${profile.displayName || username} (@${username}) - PixelBoxx`,
    description: profile.pixelPage?.bio || `Check out ${username}'s PixelPage on PixelBoxx!`,
  };
}
