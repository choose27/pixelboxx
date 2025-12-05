import { NotificationType } from '@prisma/client';

export interface NotificationTemplate {
  title: string;
  body: (data: any) => string;
  action: (data: any) => string;
  icon?: string;
}

export const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  // Social notifications
  FRIEND_REQUEST: {
    title: 'Friend Request',
    body: (data) => `${data.senderName} wants to be your friend`,
    action: (data) => '/friends/requests',
    icon: 'user-plus',
  },
  FRIEND_ACCEPTED: {
    title: 'Friend Request Accepted',
    body: (data) => `${data.accepterName} accepted your friend request`,
    action: (data) => `/@${data.accepterUsername}`,
    icon: 'users',
  },
  NEW_FOLLOWER: {
    title: 'New Follower',
    body: (data) => `${data.followerName} started following you`,
    action: (data) => `/@${data.followerUsername}`,
    icon: 'heart',
  },
  TOP_FRIEND_ADDED: {
    title: 'Top Friend Alert!',
    body: (data) => `${data.userName} added you to their Top Friends at position #${data.position}`,
    action: (data) => `/@${data.userUsername}`,
    icon: 'star',
  },
  TOP_FRIEND_REMOVED: {
    title: 'Top Friend Update',
    body: (data) => `${data.userName} removed you from their Top Friends`,
    action: (data) => `/@${data.userUsername}`,
    icon: 'star-outline',
  },

  // Content notifications
  GUESTBOOK_ENTRY: {
    title: 'New Guestbook Entry',
    body: (data) => `${data.authorName} left a message on your profile`,
    action: (data) => `/@${data.profileUsername}#guestbook`,
    icon: 'message-square',
  },
  MESSAGE_MENTION: {
    title: 'You were mentioned',
    body: (data) => `${data.authorName} mentioned you in ${data.boxxName}`,
    action: (data) => `/boxxes/${data.boxxSlug}/channels/${data.channelId}`,
    icon: 'at-sign',
  },

  // Boxx notifications
  BOXX_INVITE: {
    title: 'Boxx Invitation',
    body: (data) => `${data.inviterName} invited you to join ${data.boxxName}`,
    action: (data) => `/boxxes/${data.boxxSlug}`,
    icon: 'inbox',
  },
  BOXX_JOIN: {
    title: 'New Member',
    body: (data) => `${data.memberName} joined ${data.boxxName}`,
    action: (data) => `/boxxes/${data.boxxSlug}`,
    icon: 'user-check',
  },
  CHANNEL_MENTION: {
    title: 'Channel Mention',
    body: (data) => `${data.authorName} mentioned you in #${data.channelName}`,
    action: (data) => `/boxxes/${data.boxxSlug}/channels/${data.channelId}`,
    icon: 'hash',
  },

  // System notifications
  WELCOME: {
    title: 'Welcome to PixelBoxx!',
    body: (data) => `Start customizing your profile and making friends`,
    action: (data) => `/@${data.username}`,
    icon: 'sparkles',
  },
  PROFILE_VIEW_MILESTONE: {
    title: 'Profile Milestone',
    body: (data) => `Your profile has been viewed ${data.views} times!`,
    action: (data) => `/@${data.username}`,
    icon: 'trending-up',
  },
};

export function formatNotification(type: NotificationType, data: any) {
  const template = NOTIFICATION_TEMPLATES[type];
  return {
    title: template.title,
    body: template.body(data),
    action: template.action(data),
    icon: template.icon,
  };
}
