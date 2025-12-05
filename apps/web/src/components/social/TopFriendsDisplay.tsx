'use client';

import { useUserTopFriends } from '@/hooks/useTopFriends';
import Link from 'next/link';

interface TopFriendsDisplayProps {
  userId: string;
}

export default function TopFriendsDisplay({ userId }: TopFriendsDisplayProps) {
  const { topFriends, loading } = useUserTopFriends(userId);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-xl font-bold mb-4 text-cyan-400">Top Friends</h3>
        <div className="text-center py-8 text-gray-400">Loading...</div>
      </div>
    );
  }

  if (topFriends.length === 0) {
    return null; // Don't show if no top friends
  }

  const getMedalEmoji = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `#${position}`;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border-2 border-cyan-500/30 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Top Friends
        </h3>
        <span className="text-2xl">⭐</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {topFriends
          .sort((a, b) => a.position - b.position)
          .map((tf) => (
            <Link
              key={tf.id}
              href={`/@${tf.friend.username}`}
              className="relative bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-cyan-400 transition-all hover:scale-105 group"
            >
              {/* Position badge */}
              <div className="absolute -top-2 -left-2 w-7 h-7 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-xs shadow-lg z-10">
                {getMedalEmoji(tf.position)}
              </div>

              <div className="flex flex-col items-center">
                <img
                  src={tf.friend.avatarUrl || '/default-avatar.png'}
                  alt={tf.friend.username}
                  className="w-16 h-16 rounded-full mb-2 border-2 border-gray-700 group-hover:border-cyan-400 transition-colors"
                />
                <p className="font-semibold text-center text-sm truncate w-full">
                  {tf.friend.displayName || tf.friend.username}
                </p>
                <p className="text-xs text-gray-400 truncate w-full text-center">
                  @{tf.friend.username}
                </p>
              </div>
            </Link>
          ))}
      </div>

      {topFriends.length < 8 && (
        <p className="text-xs text-gray-500 text-center mt-4">
          {topFriends.length} / 8 slots filled
        </p>
      )}
    </div>
  );
}
