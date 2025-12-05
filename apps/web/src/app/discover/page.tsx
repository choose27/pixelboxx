'use client';

import { useState } from 'react';
import { useFriends } from '@/hooks/useFriends';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const { sendRequest } = useFriends();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/users/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (userId: string) => {
    try {
      await sendRequest(userId);
      alert('Friend request sent!');
    } catch (error: any) {
      alert(error.message || 'Failed to send friend request');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Discover Users</h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username..."
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-cyan-500 transition-colors"
              >
                <Link href={`/@${user.username}`} className="block mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl || '/default-avatar.png'}
                      alt={user.username}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">
                        {user.displayName || user.username}
                      </h3>
                      <p className="text-sm text-gray-400">@{user.username}</p>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => handleAddFriend(user.id)}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors"
                >
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Users */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">New to PixelBoxx</h2>
        <div className="text-center py-8 text-gray-400">
          New users will appear here
        </div>
      </div>

      {/* People You May Know */}
      <div>
        <h2 className="text-xl font-bold mb-4">People You May Know</h2>
        <p className="text-gray-400 text-center py-8">
          Friend suggestions based on mutual friends will appear here
        </p>
      </div>

      {/* Tips */}
      <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h3 className="font-bold mb-2">Tips for Finding Friends</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Search for friends by their username</li>
          <li>• Check out who your friends are friends with</li>
          <li>• Look at Top Friends on profiles you like</li>
          <li>• Join boxxes to meet people with similar interests</li>
        </ul>
      </div>
    </div>
  );
}
