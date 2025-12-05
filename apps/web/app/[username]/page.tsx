import { notFound } from 'next/navigation';
import { ProfileRenderer } from '@/components/pixelpage/ProfileRenderer';
import { pixelPagesApi } from '@/lib/api-client';

interface PageProps {
  params: {
    username: string;
  };
}

async function getProfile(username: string) {
  try {
    return await pixelPagesApi.getByUsername(username);
  } catch (error: any) {
    if (error.status === 404) {
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
    description: profile.pixelPage.bio || `Check out ${username}'s PixelPage on PixelBoxx!`,
  };
}
