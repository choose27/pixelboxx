'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/activity/friends`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error('Failed to load activities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'PROFILE_UPDATED':
        return '✏️';
      case 'PHOTOS_ADDED':
        return '📸';
      case 'JOINED_BOXX':
        return '🏠';
      case 'NEW_FRIEND':
        return '👥';
      case 'TOP_FRIENDS_CHANGED':
        return '⭐';
      case 'THEME_CHANGED':
        return '🎨';
      default:
        return '📌';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-xl font-bold mb-4">Friends Activity</h3>
        <div className="text-center py-8 text-gray-400">Loading activity...</div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-xl font-bold mb-4">Friends Activity</h3>
        <div className="text-center py-8 text-gray-400">
          No recent activity from friends
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <h3 className="text-xl font-bold mb-4">Friends Activity</h3>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
          >
            <Link href={`/@${activity.user.username}`}>
              <img
                src={activity.user.avatarUrl || '/default-avatar.png'}
                alt={activity.user.username}
                className="w-10 h-10 rounded-full"
              />
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <span className="text-lg">{getActivityIcon(activity.type)}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-300">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getTimeAgo(activity.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/activity"
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          View all activity
        </Link>
      </div>
    </div>
  );
}
