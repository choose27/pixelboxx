'use client';

import { useState } from 'react';
import { useFriends, useFriendRequests } from '@/hooks/useFriends';

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'requests' | 'sent' | 'blocked'>('all');
  const { friends, loading, acceptRequest, rejectRequest, removeFriend } = useFriends();
  const { requests, loading: requestsLoading } = useFriendRequests();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Friends</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          All Friends ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'requests'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Requests ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'sent'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Sent Requests
        </button>
        <button
          onClick={() => setActiveTab('blocked')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'blocked'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Blocked
        </button>
      </div>

      {/* All Friends Tab */}
      {activeTab === 'all' && (
        <div>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading friends...</div>
          ) : friends.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No friends yet. Start adding friends!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="bg-gray-800 rounded-lg p-4 flex items-center gap-4 border border-gray-700 hover:border-cyan-500 transition-colors"
                >
                  <img
                    src={friend.avatarUrl || '/default-avatar.png'}
                    alt={friend.username}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {friend.displayName || friend.username}
                    </h3>
                    <p className="text-sm text-gray-400">@{friend.username}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Friends since {new Date(friend.friendsSince).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFriend(friend.id)}
                    className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div>
          {requestsLoading ? (
            <div className="text-center py-12 text-gray-400">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No pending requests</div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-gray-800 rounded-lg p-4 flex items-center gap-4 border border-gray-700"
                >
                  <img
                    src={request.requester.avatarUrl || '/default-avatar.png'}
                    alt={request.requester.username}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {request.requester.displayName || request.requester.username}
                    </h3>
                    <p className="text-sm text-gray-400">@{request.requester.username}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptRequest(request.id)}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => rejectRequest(request.id)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sent Requests Tab */}
      {activeTab === 'sent' && (
        <div className="text-center py-12 text-gray-400">
          Sent requests feature coming soon
        </div>
      )}

      {/* Blocked Tab */}
      {activeTab === 'blocked' && (
        <div className="text-center py-12 text-gray-400">
          Blocked users feature coming soon
        </div>
      )}
    </div>
  );
}
