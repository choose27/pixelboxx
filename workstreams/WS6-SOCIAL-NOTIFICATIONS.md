# Workstream 6: Social Graph & Notifications

## Overview
The connections that make it a social platform - friends, followers, Top Friends drama, and keeping users engaged with notifications.

**Priority:** 🟤 HIGH - Social features drive retention and engagement.

---

## Task Breakdown

### 6.1 Friends System Data Model
**Estimated effort:** 4-6 hours

- [ ] **6.1.1** Database schema:
```prisma
model Friendship {
  id           String   @id @default(uuid())
  requesterId  String   @map("requester_id")
  addresseeId  String   @map("addressee_id")
  status       FriendshipStatus @default(PENDING)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  
  requester    User     @relation("SentRequests", fields: [requesterId], references: [id])
  addressee    User     @relation("ReceivedRequests", fields: [addresseeId], references: [id])
  
  @@unique([requesterId, addresseeId])
  @@map("friendships")
}

enum FriendshipStatus {
  PENDING
  ACCEPTED
  BLOCKED
}

model TopFriend {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  friendId  String   @map("friend_id")
  position  Int      // 1-8
  createdAt DateTime @default(now()) @map("created_at")
  
  user      User     @relation("UserTopFriends", fields: [userId], references: [id], onDelete: Cascade)
  friend    User     @relation("FriendTopFriends", fields: [friendId], references: [id], onDelete: Cascade)
  
  @@unique([userId, position])
  @@unique([userId, friendId])
  @@map("top_friends")
}

model Block {
  id        String   @id @default(uuid())
  blockerId String   @map("blocker_id")
  blockedId String   @map("blocked_id")
  createdAt DateTime @default(now()) @map("created_at")
  
  blocker   User     @relation("BlocksMade", fields: [blockerId], references: [id])
  blocked   User     @relation("BlocksReceived", fields: [blockedId], references: [id])
  
  @@unique([blockerId, blockedId])
  @@map("blocks")
}
```

- [ ] **6.1.2** Create Friends module in NestJS
- [ ] **6.1.3** API endpoints:
  - `POST /friends/request/:userId` - Send friend request
  - `POST /friends/accept/:requestId` - Accept request
  - `POST /friends/reject/:requestId` - Reject request
  - `DELETE /friends/:userId` - Remove friend
  - `GET /friends` - List friends
  - `GET /friends/requests` - List pending requests
  - `GET /friends/requests/sent` - List sent requests
  - `GET /users/:userId/friends` - View user's public friends

**Deliverable:** Full friend system CRUD.

---

### 6.2 Top Friends Feature 💫
**Estimated effort:** 6-8 hours

The MySpace drama feature - ranked best friends.

- [ ] **6.2.1** Top Friends API:
  - `GET /me/top-friends` - Get your Top 8
  - `PUT /me/top-friends` - Update rankings
  - `DELETE /me/top-friends/:position` - Remove from position

- [ ] **6.2.2** Ranking logic:
  - 8 slots (classic MySpace)
  - Can have fewer than 8
  - Reordering is drag-and-drop
  - Friend must exist before adding to Top

- [ ] **6.2.3** Top Friends editor UI:
  - Show current Top Friends with positions
  - Search/select friends to add
  - Drag to reorder
  - Click to remove
  - Save button (batch update)

- [ ] **6.2.4** Top Friends display on profile:
  - Grid of 8 (or fewer)
  - Rank numbers visible
  - Avatar + username
  - Link to their profile
  - Custom styling per theme

- [ ] **6.2.5** "You've been added to X's Top Friends" notification

**Deliverable:** Full Top Friends feature with the drama potential.

---

### 6.3 Follower System (Optional Public Following)
**Estimated effort:** 4-6 hours

For users who want public profiles without mutual friendship.

- [ ] **6.3.1** Database schema:
```prisma
model Follow {
  id          String   @id @default(uuid())
  followerId  String   @map("follower_id")
  followingId String   @map("following_id")
  createdAt   DateTime @default(now()) @map("created_at")
  
  follower    User     @relation("Following", fields: [followerId], references: [id])
  following   User     @relation("Followers", fields: [followingId], references: [id])
  
  @@unique([followerId, followingId])
  @@map("follows")
}
```

- [ ] **6.3.2** API endpoints:
  - `POST /follow/:userId` - Follow user
  - `DELETE /follow/:userId` - Unfollow
  - `GET /me/followers` - List followers
  - `GET /me/following` - List following
  - `GET /users/:userId/followers` - View user's followers
  - `GET /users/:userId/following` - View user's following

- [ ] **6.3.3** Privacy settings:
  - Allow followers: yes/no
  - Public follower count: yes/no
  - Public following list: yes/no

- [ ] **6.3.4** Follower counts on profile

**Deliverable:** Optional public following system.

---

### 6.4 Block System
**Estimated effort:** 3-4 hours

Essential safety feature.

- [ ] **6.4.1** API endpoints:
  - `POST /block/:userId` - Block user
  - `DELETE /block/:userId` - Unblock user
  - `GET /me/blocked` - List blocked users

- [ ] **6.4.2** Block effects:
  - Can't see their profile
  - Can't see their messages in shared boxxes
  - Can't DM them
  - They can't see you
  - Removed from friends if blocked

- [ ] **6.4.3** Block UI:
  - Block button on profile
  - Blocked users page in settings
  - Unblock action

**Deliverable:** Complete block functionality.

---

### 6.5 Notification System
**Estimated effort:** 10-14 hours

Keep users engaged and informed.

- [ ] **6.5.1** Database schema:
```prisma
model Notification {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  type      NotificationType
  data      Json     // Flexible payload
  read      Boolean  @default(false)
  createdAt DateTime @default(now()) @map("created_at")
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, read, createdAt])
  @@map("notifications")
}

enum NotificationType {
  // Social
  FRIEND_REQUEST
  FRIEND_ACCEPTED
  NEW_FOLLOWER
  TOP_FRIEND_ADDED
  
  // Content
  GUESTBOOK_ENTRY
  MESSAGE_MENTION
  
  // Boxxes
  REALM_INVITE
  CHANNEL_MENTION
  
  // System
  WELCOME
  PROFILE_VIEW_MILESTONE
}
```

- [ ] **6.5.2** Notification service:
```typescript
class NotificationService {
  async create(userId: string, type: NotificationType, data: any): Promise<void>;
  async markRead(notificationId: string): Promise<void>;
  async markAllRead(userId: string): Promise<void>;
  async getUnreadCount(userId: string): Promise<number>;
  async list(userId: string, options: PaginationOptions): Promise<Notification[]>;
}
```

- [ ] **6.5.3** Real-time notifications via NATS:
  - Subscribe to `pixelboxx.users.{userId}.notifications`
  - Push new notifications to connected clients
  - Play sound (optional, user preference)

- [ ] **6.5.4** Notification templates:
```typescript
const NOTIFICATION_TEMPLATES = {
  FRIEND_REQUEST: {
    title: 'Friend Request',
    body: '{senderName} wants to be your friend',
    action: '/friends/requests',
  },
  GUESTBOOK_ENTRY: {
    title: 'New Guestbook Entry',
    body: '{authorName} left a message on your profile',
    action: '/@{username}#guestbook',
  },
  // ...
}
```

- [ ] **6.5.5** API endpoints:
  - `GET /notifications` - List notifications (paginated)
  - `GET /notifications/unread-count` - Get unread count
  - `POST /notifications/:id/read` - Mark as read
  - `POST /notifications/read-all` - Mark all as read
  - `DELETE /notifications/:id` - Delete notification

**Deliverable:** Full notification system with real-time delivery.

---

### 6.6 Notification Preferences
**Estimated effort:** 4-6 hours

Let users control what they get notified about.

- [ ] **6.6.1** Preferences schema:
```prisma
model NotificationPreferences {
  id              String   @id @default(uuid())
  userId          String   @unique @map("user_id")
  
  // Email notifications
  emailEnabled    Boolean  @default(true) @map("email_enabled")
  emailDigest     DigestFrequency @default(DAILY) @map("email_digest")
  
  // Push notifications (future)
  pushEnabled     Boolean  @default(true) @map("push_enabled")
  
  // Per-type toggles
  friendRequests  Boolean  @default(true) @map("friend_requests")
  guestbookEntries Boolean @default(true) @map("guestbook_entries")
  mentions        Boolean  @default(true)
  boxxInvites    Boolean  @default(true) @map("boxx_invites")
  
  user            User     @relation(fields: [userId], references: [id])
  
  @@map("notification_preferences")
}

enum DigestFrequency {
  REALTIME
  DAILY
  WEEKLY
  NEVER
}
```

- [ ] **6.6.2** Settings UI for notification preferences
- [ ] **6.6.3** Respect preferences when sending notifications
- [ ] **6.6.4** Email notification system (for async notifications)

**Deliverable:** Granular notification controls.

---

### 6.7 Notification UI Components
**Estimated effort:** 6-8 hours

Frontend for notifications.

- [ ] **6.7.1** Notification bell (in top bar):
  - Icon with unread count badge
  - Dropdown on click
  - Quick view of recent notifications
  - "View all" link

- [ ] **6.7.2** Notification dropdown:
  - Scrollable list
  - Notification items with icon, message, time
  - Click to navigate to action
  - "Mark all read" button

- [ ] **6.7.3** Full notifications page:
  - Full list with pagination
  - Filter by type
  - Bulk actions

- [ ] **6.7.4** Toast for real-time notifications:
  - Pop up when new notification arrives
  - Auto-dismiss after 5 seconds
  - Click to navigate

- [ ] **6.7.5** Notification item component:
  - Type icon
  - Title
  - Body (with actor name linked)
  - Relative time
  - Read/unread state

**Deliverable:** Complete notification UI.

---

### 6.8 Activity Feed
**Estimated effort:** 6-8 hours

See what friends are up to.

- [ ] **6.8.1** Activity types:
  - Updated their profile
  - Added new photos
  - Joined a boxx
  - Made a new friend
  - Changed their Top Friends

- [ ] **6.8.2** Activity model:
```prisma
model Activity {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  type      ActivityType
  data      Json
  createdAt DateTime @default(now()) @map("created_at")
  
  user      User     @relation(fields: [userId], references: [id])
  
  @@index([userId, createdAt])
  @@map("activities")
}
```

- [ ] **6.8.3** Friends activity feed:
  - Show activities from friends
  - Sorted by recency
  - Paginated

- [ ] **6.8.4** Privacy controls:
  - Choose what activities are public
  - Option to hide all activity

- [ ] **6.8.5** Activity feed UI component

**Deliverable:** Friend activity feed.

---

### 6.9 User Discovery
**Estimated effort:** 4-6 hours

Help users find friends.

- [ ] **6.9.1** User search:
  - Search by username
  - Search by display name
  - Autocomplete suggestions

- [ ] **6.9.2** "People you may know":
  - Friends of friends
  - In same boxxes
  - Similar interests (future)

- [ ] **6.9.3** Browse users:
  - New members
  - Active members
  - Cool profiles (featured)

- [ ] **6.9.4** Invite friends (external):
  - Invite link generation
  - Share on social media
  - Track invites

**Deliverable:** User discovery features.

---

## Dependencies

**Depends on WS1:**
- Authentication
- Database
- Redis (for real-time)

**Depends on WS3:**
- NATS integration (for real-time notifications)

**Depends on WS5:**
- UI components
- App shell (notification bell location)

---

## Acceptance Criteria

- [ ] Users can send and accept friend requests
- [ ] Users can manage Top 8 friends
- [ ] Top Friends display on profile
- [ ] Users can follow others (if enabled)
- [ ] Users can block others
- [ ] Notifications are delivered in real-time
- [ ] Users can control notification preferences
- [ ] Activity feed shows friends' updates
- [ ] Users can discover new friends

---

## Files to Create

```
apps/api/src/
├── friends/
│   ├── friends.module.ts
│   ├── friends.controller.ts
│   ├── friends.service.ts
│   └── dto/
├── follows/
│   ├── follows.module.ts
│   ├── follows.controller.ts
│   └── follows.service.ts
├── blocks/
│   ├── blocks.module.ts
│   ├── blocks.controller.ts
│   └── blocks.service.ts
├── notifications/
│   ├── notifications.module.ts
│   ├── notifications.controller.ts
│   ├── notifications.service.ts
│   ├── notifications.gateway.ts    # WebSocket
│   └── templates/
│       └── notification-templates.ts
└── activity/
    ├── activity.module.ts
    ├── activity.controller.ts
    └── activity.service.ts

apps/web/src/
├── components/
│   └── social/
│       ├── FriendsList.tsx
│       ├── FriendRequest.tsx
│       ├── TopFriendsEditor.tsx
│       ├── TopFriendsDisplay.tsx
│       ├── FollowButton.tsx
│       ├── BlockButton.tsx
│       ├── NotificationBell.tsx
│       ├── NotificationDropdown.tsx
│       ├── NotificationItem.tsx
│       ├── ActivityFeed.tsx
│       └── UserSearch.tsx
├── app/
│   ├── friends/
│   │   └── page.tsx
│   ├── notifications/
│   │   └── page.tsx
│   └── settings/
│       └── notifications/
│           └── page.tsx
└── hooks/
    ├── useFriends.ts
    ├── useNotifications.ts
    └── useActivity.ts
```

---

## Notes for Agents

1. **Privacy first** - Always check privacy settings before exposing data.
2. **Block is sacred** - Blocked users should be invisible to each other.
3. **Real-time feels** - Notifications should feel instant.
4. **Drama potential** - Top Friends is social dynamite. Handle with care.
5. **Abuse prevention** - Rate limit friend requests, implement spam detection.
