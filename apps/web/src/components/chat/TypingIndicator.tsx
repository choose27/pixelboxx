'use client';

interface TypingIndicatorProps {
  users: Array<{ username: string; displayName?: string }>;
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const names = users.map((u) => u.displayName || u.username);
  let text = '';

  if (names.length === 1) {
    text = `${names[0]} is typing...`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing...`;
  } else {
    text = `${names[0]}, ${names[1]} and ${names.length - 2} others are typing...`;
  }

  return (
    <div className="px-4 py-2 text-sm text-gray-500 italic">
      {text}
    </div>
  );
}
