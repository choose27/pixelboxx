'use client';

interface Member {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  presence?: {
    status: 'online' | 'idle' | 'offline';
  };
}

interface MemberSidebarProps {
  members: Member[];
}

export function MemberSidebar({ members }: MemberSidebarProps) {
  const onlineMembers = members.filter((m) => m.presence?.status === 'online');
  const offlineMembers = members.filter((m) => m.presence?.status !== 'online');

  const renderMember = (member: Member) => {
    const displayName = member.displayName || member.username;
    const statusColor =
      member.presence?.status === 'online'
        ? 'bg-green-500'
        : member.presence?.status === 'idle'
        ? 'bg-yellow-500'
        : 'bg-gray-400';

    return (
      <div key={member.id} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded">
        <div className="relative">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={displayName}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm">
              {displayName[0].toUpperCase()}
            </div>
          )}
          <div
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${statusColor}`}
          />
        </div>
        <span className="text-sm text-gray-900 truncate">{displayName}</span>
      </div>
    );
  };

  return (
    <div className="w-60 flex-shrink-0 bg-gray-50 overflow-y-auto border-l border-gray-200">
      <div className="p-4">
        {onlineMembers.length > 0 && (
          <>
            <h3 className="text-xs font-semibold uppercase text-gray-600 mb-2">
              Online — {onlineMembers.length}
            </h3>
            <div className="space-y-1 mb-4">
              {onlineMembers.map(renderMember)}
            </div>
          </>
        )}
        {offlineMembers.length > 0 && (
          <>
            <h3 className="text-xs font-semibold uppercase text-gray-600 mb-2">
              Offline — {offlineMembers.length}
            </h3>
            <div className="space-y-1">
              {offlineMembers.map(renderMember)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
