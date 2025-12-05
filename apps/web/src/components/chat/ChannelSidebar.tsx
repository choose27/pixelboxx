'use client';

interface Channel {
  id: string;
  name: string;
  type: string;
}

interface ChannelSidebarProps {
  channels: Channel[];
  currentChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
}

export function ChannelSidebar({
  channels,
  currentChannelId,
  onSelectChannel,
}: ChannelSidebarProps) {
  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'TEXT':
        return '#';
      case 'VOICE':
        return '🔊';
      case 'ANNOUNCEMENT':
        return '📢';
      default:
        return '#';
    }
  };

  return (
    <div className="w-60 flex-shrink-0 bg-gray-100 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xs font-semibold uppercase text-gray-600 mb-2">
          Channels
        </h2>
        <div className="space-y-1">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onSelectChannel(channel.id)}
              className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 ${
                currentChannelId === channel.id
                  ? 'bg-gray-300 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-gray-500">{getChannelIcon(channel.type)}</span>
              <span className="truncate">{channel.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
