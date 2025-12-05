'use client';

import { useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';

export interface Message {
  id: string;
  content: string;
  authorId: string;
  channelId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  reactions?: any[];
  replyTo?: any;
}

export function useMessages(socket: Socket | null, channelId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    if (!socket || !channelId) return;

    const handleMessage = (data: any) => {
      if (data.type === 'message') {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === data.data.id)) {
            return prev;
          }
          return [...prev, data.data];
        });
      } else if (data.type === 'message_update') {
        setMessages((prev) =>
          prev.map((m) => (m.id === data.data.id ? data.data : m)),
        );
      } else if (data.type === 'message_delete') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === data.data.id
              ? { ...m, content: '[deleted]', isDeleted: true }
              : m,
          ),
        );
      }
    };

    const handleUserTyping = (data: any) => {
      setTypingUsers((prev) => {
        const updated = new Map(prev);
        updated.set(data.userId, data);
        return updated;
      });

      // Remove typing indicator after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = new Map(prev);
          updated.delete(data.userId);
          return updated;
        });
      }, 3000);
    };

    socket.on('message', handleMessage);
    socket.on('user-typing', handleUserTyping);

    return () => {
      socket.off('message', handleMessage);
      socket.off('user-typing', handleUserTyping);
    };
  }, [socket, channelId]);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const setInitialMessages = useCallback((msgs: Message[]) => {
    setMessages(msgs);
  }, []);

  return {
    messages,
    typingUsers: Array.from(typingUsers.values()),
    addMessage,
    setInitialMessages,
  };
}
