'use client';

import { useState, useEffect } from 'react';
import { useTopFriends } from '@/hooks/useTopFriends';
import { useFriends } from '@/hooks/useFriends';

export default function TopFriendsEditor() {
  const { topFriends, loading, updateTopFriends } = useTopFriends();
  const { friends } = useFriends();

  const [slots, setSlots] = useState<Array<any | null>>(Array(8).fill(null));
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showFriendPicker, setShowFriendPicker] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize slots from topFriends
  useEffect(() => {
    const newSlots = Array(8).fill(null);
    topFriends.forEach((tf) => {
      if (tf.position >= 1 && tf.position <= 8) {
        newSlots[tf.position - 1] = tf.friend;
      }
    });
    setSlots(newSlots);
  }, [topFriends]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newSlots = [...slots];
    const temp = newSlots[dropIndex];
    newSlots[dropIndex] = newSlots[draggedIndex];
    newSlots[draggedIndex] = temp;

    setSlots(newSlots);
    setDraggedIndex(null);
  };

  const handleAddFriend = (position: number, friend: any) => {
    const newSlots = [...slots];
    newSlots[position] = friend;
    setSlots(newSlots);
    setShowFriendPicker(null);
  };

  const handleRemove = (position: number) => {
    if (!confirm('Are you sure? This might cause drama!')) return;

    const newSlots = [...slots];
    newSlots[position] = null;
    setSlots(newSlots);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage('');

    try {
      const positions = slots
        .map((friend, index) =>
          friend ? { friendId: friend.id, position: index + 1 } : null
        )
        .filter((p): p is { friendId: string; position: number } => p !== null);

      await updateTopFriends(positions);
      setSuccessMessage('Top Friends updated! THE DRAMA!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      alert('Failed to update Top Friends');
    } finally {
      setSaving(false);
    }
  };

  const getMedalEmoji = (position: number) => {
    if (position === 0) return '🥇';
    if (position === 1) return '🥈';
    if (position === 2) return '🥉';
    return `#${position + 1}`;
  };

  const availableFriends = friends.filter(
    (f) => !slots.some((s) => s?.id === f.id)
  );

  if (loading) {
    return <div className="text-center py-12">Loading Top Friends...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Edit Your Top 8 Friends</h2>
        <p className="text-gray-400">
          Drag to reorder, click empty slots to add friends. This is the drama feature!
        </p>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-600 rounded-lg text-center font-semibold animate-pulse">
          {successMessage}
        </div>
      )}

      {/* Top Friends Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {slots.map((friend, index) => (
          <div
            key={index}
            draggable={!!friend}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            className={`
              relative aspect-square rounded-lg border-2 transition-all
              ${friend ? 'bg-gray-800 border-cyan-500 cursor-move' : 'bg-gray-900 border-gray-700 border-dashed'}
              ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}
              hover:border-cyan-400
            `}
          >
            {/* Position badge */}
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-sm shadow-lg z-10">
              {getMedalEmoji(index)}
            </div>

            {friend ? (
              <>
                <div className="p-4 h-full flex flex-col items-center justify-center">
                  <img
                    src={friend.avatarUrl || '/default-avatar.png'}
                    alt={friend.username}
                    className="w-20 h-20 rounded-full mb-2"
                  />
                  <p className="font-semibold text-center text-sm">
                    {friend.displayName || friend.username}
                  </p>
                  <p className="text-xs text-gray-400">@{friend.username}</p>
                </div>
                <button
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowFriendPicker(index)}
                className="w-full h-full flex items-center justify-center text-gray-500 hover:text-cyan-400 transition-colors"
              >
                <span className="text-4xl">+</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 rounded-lg font-semibold text-lg transition-all disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Top Friends'}
      </button>

      {/* Friend Picker Modal */}
      {showFriendPicker !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              Choose Friend for Position {getMedalEmoji(showFriendPicker)}
            </h3>

            {availableFriends.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                No available friends. All your friends are already in your Top 8!
              </p>
            ) : (
              <div className="space-y-2">
                {availableFriends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => handleAddFriend(showFriendPicker, friend)}
                    className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-3 transition-colors"
                  >
                    <img
                      src={friend.avatarUrl || '/default-avatar.png'}
                      alt={friend.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="text-left">
                      <p className="font-semibold">
                        {friend.displayName || friend.username}
                      </p>
                      <p className="text-sm text-gray-400">@{friend.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowFriendPicker(null)}
              className="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
