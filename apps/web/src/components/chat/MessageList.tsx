'use client';

import { useEffect, useRef } from 'react';
import { Message as MessageComponent } from './Message';

interface MessageListProps {
  messages: any[];
  onReact?: (messageId: string, emoji: string) => void;
}

export function MessageList({ messages, onReact }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-gray-500">
          No messages yet. Start the conversation!
        </div>
      ) : (
        <div className="space-y-0.5">
          {messages.map((message) => (
            <MessageComponent
              key={message.id}
              message={message}
              onReact={(emoji) => onReact?.(message.id, emoji)}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
