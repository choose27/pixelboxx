'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationsPage() {
  const { notifications, loading, markRead, markAllRead, deleteNotification } = useNotifications();
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const getIconForType = (icon?: string) => {
    switch (icon) {
      case 'user-plus': return '👤';
      case 'users': return '👥';
      case 'heart': return '❤️';
      case 'star': return '⭐';
      case 'message-square': return '💬';
      case 'at-sign': return '@';
      case 'inbox': return '📥';
      default: return '🔔';
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markRead(notification.id);
    }
    if (notification.action) {
      window.location.href = notification.action;
    }
  };

  const filteredNotifications = typeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === typeFilter);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <div className="flex gap-2">
          <button
            onClick={() => markAllRead()}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
          >
            Mark all read
          </button>
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
            typeFilter === 'all'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setTypeFilter('FRIEND_REQUEST')}
          className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
            typeFilter === 'FRIEND_REQUEST'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          👤 Friends
        </button>
        <button
          onClick={() => setTypeFilter('TOP_FRIEND_ADDED')}
          className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
            typeFilter === 'TOP_FRIEND_ADDED'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          ⭐ Top Friends
        </button>
        <button
          onClick={() => setTypeFilter('GUESTBOOK_ENTRY')}
          className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
            typeFilter === 'GUESTBOOK_ENTRY'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          💬 Guestbook
        </button>
        <button
          onClick={() => setTypeFilter('MESSAGE_MENTION')}
          className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
            typeFilter === 'MESSAGE_MENTION'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          @ Mentions
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading notifications...</div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No notifications {typeFilter !== 'all' && 'in this category'}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-gray-800 rounded-lg p-4 flex items-start gap-4 border transition-all ${
                !notification.read
                  ? 'border-cyan-500/50 bg-gray-800/80'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <span className="text-3xl flex-shrink-0">
                {getIconForType(notification.icon)}
              </span>

              <div className="flex-1 min-w-0">
                <button
                  onClick={() => handleNotificationClick(notification)}
                  className="w-full text-left"
                >
                  <p className="font-semibold mb-1">{notification.title}</p>
                  <p className="text-gray-400 mb-2">{notification.body}</p>
                  <p className="text-xs text-gray-500">{getTimeAgo(notification.createdAt)}</p>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {!notification.read && (
                  <button
                    onClick={() => markRead(notification.id)}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>

              {!notification.read && (
                <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
