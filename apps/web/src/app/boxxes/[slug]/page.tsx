'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useRealtime } from '@/hooks/useRealtime';
import { useMessages } from '@/hooks/useMessages';
import { ChannelSidebar } from '@/components/chat/ChannelSidebar';
import { MessageList } from '@/components/chat/MessageList';
import { MessageComposer } from '@/components/chat/MessageComposer';
import { MemberSidebar } from '@/components/chat/MemberSidebar';
import { TypingIndicator } from '@/components/chat/TypingIndicator';

interface Boxx {
  id: string;
  name: string;
  slug: string;
  description?: string;
  channels: Array<{ id: string; name: string; type: string }>;
}

export default function BoxxViewPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [token, setToken] = useState<string>('');
  const [boxx, setBoxx] = useState<Boxx | null>(null);
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { socket, connected, subscribeToChannel, unsubscribeFromChannel, sendTyping } =
    useRealtime(token);
  const { messages, typingUsers, addMessage, setInitialMessages } = useMessages(
    socket,
    currentChannelId,
  );

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchBoxx();
    }
  }, [slug, token]);

  useEffect(() => {
    if (currentChannelId && connected) {
      subscribeToChannel(currentChannelId);
      fetchMessages();
      fetchMembers();

      return () => {
        unsubscribeFromChannel(currentChannelId);
      };
    }
  }, [currentChannelId, connected]);

  const fetchBoxx = async () => {
    try {
      const res = await fetch(`http://localhost:3001/boxxes/${slug}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setBoxx(data);

      // Auto-select first channel
      if (data.channels && data.channels.length > 0) {
        setCurrentChannelId(data.channels[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch boxx:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!currentChannelId) return;

    try {
      const res = await fetch(
        `http://localhost:3001/channels/${currentChannelId}/messages?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      setInitialMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const fetchMembers = async () => {
    if (!boxx) return;

    try {
      const res = await fetch(`http://localhost:3001/boxxes/${boxx.id}/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setMembers(data);

      // Fetch online status
      const presenceRes = await fetch(
        `http://localhost:3001/presence/boxxes/${boxx.id}/online`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const presenceData = await presenceRes.json();

      // Merge presence data
      setMembers(presenceData);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentChannelId) return;

    try {
      const res = await fetch(
        `http://localhost:3001/channels/${currentChannelId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        },
      );
      const data = await res.json();
      addMessage(data);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = useCallback(() => {
    if (boxx && currentChannelId) {
      sendTyping(currentChannelId, boxx.id);
    }
  }, [boxx, currentChannelId, sendTyping]);

  const handleReact = async (messageId: string, emoji: string) => {
    try {
      await fetch(`http://localhost:3001/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emoji }),
      });
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!boxx) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-red-500">Boxx not found</div>
      </div>
    );
  }

  const currentChannel = boxx.channels.find((c) => c.id === currentChannelId);

  return (
    <div className="flex h-screen">
      {/* Channel Sidebar */}
      <ChannelSidebar
        channels={boxx.channels}
        currentChannelId={currentChannelId}
        onSelectChannel={setCurrentChannelId}
      />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Channel Header */}
        <div className="border-b border-gray-200 bg-white px-4 py-3">
          <h1 className="text-xl font-semibold text-gray-900">
            # {currentChannel?.name || 'Select a channel'}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                connected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        {/* Messages */}
        <MessageList messages={messages} onReact={handleReact} />

        {/* Typing Indicator */}
        <TypingIndicator users={typingUsers} />

        {/* Message Composer */}
        <MessageComposer
          onSend={sendMessage}
          onTyping={handleTyping}
          disabled={!connected || !currentChannelId}
        />
      </div>

      {/* Member Sidebar */}
      <MemberSidebar members={members} />
    </div>
  );
}
