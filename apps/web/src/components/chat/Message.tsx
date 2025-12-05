'use client';

import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageProps {
  message: {
    id: string;
    content: string;
    createdAt: string;
    author: {
      username: string;
      displayName?: string;
      avatarUrl?: string;
    };
    reactions?: any[];
  };
  onReact?: (emoji: string) => void;
}

export function Message({ message, onReact }: MessageProps) {
  const displayName = message.author.displayName || message.author.username;

  return (
    <div className="group flex gap-3 px-4 py-2 hover:bg-gray-50">
      <div className="flex-shrink-0">
        {message.author.avatarUrl ? (
          <img
            src={message.author.avatarUrl}
            alt={displayName}
            className="h-10 w-10 rounded-full"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
            {displayName[0].toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-gray-900">{displayName}</span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div className="prose prose-sm mt-1 max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </div>
        {message.reactions && message.reactions.length > 0 && (
          <div className="mt-1 flex gap-1">
            {message.reactions.map((reaction: any, i: number) => (
              <button
                key={i}
                className="rounded-full bg-gray-100 px-2 py-1 text-sm hover:bg-gray-200"
                onClick={() => onReact?.(reaction.emoji)}
              >
                {reaction.emoji} {reaction.count || 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
