# Workstream 3: Boxxes & Chat System

## Overview
Discord-style communities with real-time messaging. The social glue that keeps users coming back.

**Priority:** 🟢 HIGH - Essential for engagement and retention.

---

## Task Breakdown

### 3.1 Boxxes Data Model & API
**Estimated effort:** 6-8 hours

- [ ] **3.1.1** Database schema:
```prisma
model Boxx {
  id          String   @id @default(uuid())
  name        String   @db.VarChar(64)
  slug        String   @unique @db.VarChar(64)
  description String?  @db.Text
  iconUrl     String?  @map("icon_url") @db.VarChar(500)
  bannerUrl   String?  @map("banner_url") @db.VarChar(500)
  ownerId     String   @map("owner_id")
  isPublic    Boolean  @default(true) @map("is_public")
  memberCount Int      @default(0) @map("member_count")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  owner       User     @relation("OwnedBoxxes", fields: [ownerId], references: [id])
  members     BoxxMember[]
  channels    Channel[]
  roles       BoxxRole[]
  invites     BoxxInvite[]
  
  @@map("boxxes")
}

model BoxxMember {
  id        String   @id @default(uuid())
  boxxId   String   @map("boxx_id")
  userId    String   @map("user_id")
  roleId    String?  @map("role_id")
  joinedAt  DateTime @default(now()) @map("joined_at")
  
  boxx     Boxx    @relation(fields: [boxxId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      BoxxRole? @relation(fields: [roleId], references: [id])
  
  @@unique([boxxId, userId])
  @@map("boxx_members")
}

model BoxxRole {
  id          String   @id @default(uuid())
  boxxId     String   @map("boxx_id")
  name        String   @db.VarChar(32)
  color       String?  @db.VarChar(7)  // Hex color
  permissions Int      @default(0)     // Bitfield
  position    Int      @default(0)
  
  boxx       Boxx    @relation(fields: [boxxId], references: [id], onDelete: Cascade)
  members     BoxxMember[]
  
  @@map("boxx_roles")
}

model BoxxInvite {
  id        String   @id @default(uuid())
  boxxId   String   @map("boxx_id")
  code      String   @unique @db.VarChar(16)
  creatorId String   @map("creator_id")
  maxUses   Int?     @map("max_uses")
  useCount  Int      @default(0) @map("use_count")
  expiresAt DateTime? @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")
  
  boxx     Boxx    @relation(fields: [boxxId], references: [id], onDelete: Cascade)
  creator   User     @relation(fields: [creatorId], references: [id])
  
  @@map("boxx_invites")
}

model Channel {
  id        String   @id @default(uuid())
  boxxId   String   @map("boxx_id")
  name      String   @db.VarChar(64)
  topic     String?  @db.VarChar(500)
  type      ChannelType @default(TEXT)
  position  Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")
  
  boxx     Boxx    @relation(fields: [boxxId], references: [id], onDelete: Cascade)
  messages  Message[]
  
  @@map("channels")
}

enum ChannelType {
  TEXT
  VOICE
  ANNOUNCEMENT
}

model Message {
  id          String   @id @default(uuid())
  channelId   String   @map("channel_id")
  authorId    String   @map("author_id")
  content     String   @db.Text
  attachments Json?    // Array of attachment objects
  embeds      Json?    // Rich embeds
  replyToId   String?  @map("reply_to_id")
  isPinned    Boolean  @default(false) @map("is_pinned")
  isDeleted   Boolean  @default(false) @map("is_deleted")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  channel     Channel  @relation(fields: [channelId], references: [id], onDelete: Cascade)
  author      User     @relation(fields: [authorId], references: [id])
  replyTo     Message? @relation("Replies", fields: [replyToId], references: [id])
  replies     Message[] @relation("Replies")
  reactions   Reaction[]
  
  @@index([channelId, createdAt])
  @@map("messages")
}

model Reaction {
  id        String   @id @default(uuid())
  messageId String   @map("message_id")
  userId    String   @map("user_id")
  emoji     String   @db.VarChar(64)  // Unicode or custom emote ID
  createdAt DateTime @default(now()) @map("created_at")
  
  message   Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])
  
  @@unique([messageId, userId, emoji])
  @@map("reactions")
}
```

- [ ] **3.1.2** Create Boxxes module in NestJS
- [ ] **3.1.3** API endpoints:
  - `POST /boxxes` - Create boxx
  - `GET /boxxes/:slug` - Get boxx details
  - `PUT /boxxes/:id` - Update boxx
  - `DELETE /boxxes/:id` - Delete boxx
  - `GET /boxxes/:id/members` - List members
  - `POST /boxxes/:id/join` - Join (public or invite)
  - `DELETE /boxxes/:id/leave` - Leave boxx
  - `GET /users/me/boxxes` - List user's boxxes

**Deliverable:** Full CRUD for boxxes.

---

### 3.2 Channel Management
**Estimated effort:** 4-6 hours

- [ ] **3.2.1** API endpoints:
  - `POST /boxxes/:id/channels` - Create channel
  - `GET /boxxes/:id/channels` - List channels
  - `PUT /channels/:id` - Update channel
  - `DELETE /channels/:id` - Delete channel
  - `PUT /channels/:id/position` - Reorder

- [ ] **3.2.2** Channel types:
  - Text (standard messaging)
  - Announcement (only mods can post)
  - Voice (future - stub for now)

- [ ] **3.2.3** Default channels on boxx creation:
  - #general
  - #introductions

**Deliverable:** Channel CRUD working.

---

### 3.3 NATS Integration for Real-time
**Estimated effort:** 8-12 hours

You know NATS. Let's use it right.

- [ ] **3.3.1** NATS server configuration
- [ ] **3.3.2** Subject/topic structure:
```
pixelboxx.boxxes.{boxxId}.channels.{channelId}.messages
pixelboxx.boxxes.{boxxId}.presence
pixelboxx.boxxes.{boxxId}.typing.{channelId}
pixelboxx.users.{userId}.notifications
pixelboxx.users.{userId}.dms
```

- [ ] **3.3.3** NestJS NATS module setup
- [ ] **3.3.4** WebSocket gateway for client connections
- [ ] **3.3.5** Authentication for WS connections (JWT validation)
- [ ] **3.3.6** Subscription management:
  - Subscribe to channels user has access to
  - Unsubscribe on leave/disconnect
  - Handle reconnection
  
- [ ] **3.3.7** Message publishing flow:
  1. Client sends message via WS
  2. Server validates, persists to DB
  3. Server publishes to NATS
  4. All subscribed clients receive

- [ ] **3.3.8** Presence system:
  - Online/offline/idle status
  - Last seen tracking
  - Presence broadcasts on status change

**Deliverable:** Real-time message delivery working.

---

### 3.4 Message Persistence & History
**Estimated effort:** 6-8 hours

- [ ] **3.4.1** API endpoints:
  - `GET /channels/:id/messages` - Paginated message history
  - `GET /channels/:id/messages/:messageId` - Single message
  - `POST /channels/:id/messages` - Send message
  - `PUT /messages/:id` - Edit message
  - `DELETE /messages/:id` - Delete message
  - `PUT /messages/:id/pin` - Pin message

- [ ] **3.4.2** Pagination strategy:
  - Cursor-based (before/after message ID)
  - Default limit: 50 messages
  - Include whether there are more

- [ ] **3.4.3** Message formatting:
  - Markdown support (subset)
  - @mentions (users, roles, @everyone)
  - Emoji shortcodes
  - Link embeds (preview cards)

- [ ] **3.4.4** Soft delete (mark as deleted, don't remove)
- [ ] **3.4.5** Edit history (optional, track edits)

**Deliverable:** Message persistence with full history.

---

### 3.5 Typing Indicators & Presence
**Estimated effort:** 4-6 hours

- [ ] **3.5.1** Typing indicator system:
  - Client sends "typing" event
  - Server broadcasts to channel
  - Auto-expire after 5 seconds
  - Debounce on client side

- [ ] **3.5.2** Presence tracking:
  - Online when connected
  - Idle after 5 min inactivity
  - Offline on disconnect
  - Custom status message

- [ ] **3.5.3** NATS subjects for presence:
```
pixelboxx.presence.{userId}.status
pixelboxx.boxxes.{boxxId}.members.online
```

- [ ] **3.5.4** Redis for presence cache:
  - Fast lookups
  - TTL for auto-offline
  - Bulk queries (who's online in this boxx?)

**Deliverable:** Real-time typing and presence indicators.

---

### 3.6 Direct Messages
**Estimated effort:** 6-8 hours

- [ ] **3.6.1** DM data model:
```prisma
model DMChannel {
  id           String   @id @default(uuid())
  participants User[]   @relation("DMParticipants")
  createdAt    DateTime @default(now()) @map("created_at")
  lastMessageAt DateTime? @map("last_message_at")
  
  messages     DMMessage[]
  
  @@map("dm_channels")
}

model DMMessage {
  id          String   @id @default(uuid())
  channelId   String   @map("channel_id")
  authorId    String   @map("author_id")
  content     String   @db.Text
  attachments Json?
  isDeleted   Boolean  @default(false) @map("is_deleted")
  createdAt   DateTime @default(now()) @map("created_at")
  
  channel     DMChannel @relation(fields: [channelId], references: [id], onDelete: Cascade)
  author      User     @relation(fields: [authorId], references: [id])
  
  @@index([channelId, createdAt])
  @@map("dm_messages")
}
```

- [ ] **3.6.2** API endpoints:
  - `GET /dms` - List DM channels
  - `POST /dms` - Start DM (find or create)
  - `GET /dms/:id/messages` - Message history
  - `POST /dms/:id/messages` - Send DM

- [ ] **3.6.3** Group DMs (2+ participants)
- [ ] **3.6.4** DM real-time via NATS

**Deliverable:** 1:1 and group DMs working.

---

### 3.7 Reactions & Emotes
**Estimated effort:** 4-6 hours

- [ ] **3.7.1** Add reaction to message
- [ ] **3.7.2** Remove reaction
- [ ] **3.7.3** List reactions on message
- [ ] **3.7.4** Unicode emoji support
- [ ] **3.7.5** Custom boxx emotes:
```prisma
model CustomEmote {
  id        String   @id @default(uuid())
  boxxId   String   @map("boxx_id")
  name      String   @db.VarChar(32)
  imageUrl  String   @map("image_url") @db.VarChar(500)
  creatorId String   @map("creator_id")
  createdAt DateTime @default(now()) @map("created_at")
  
  boxx     Boxx    @relation(fields: [boxxId], references: [id], onDelete: Cascade)
  
  @@unique([boxxId, name])
  @@map("custom_emotes")
}
```
- [ ] **3.7.6** Emote picker UI component

**Deliverable:** Full reaction system.

---

### 3.8 Message Embeds
**Estimated effort:** 4-6 hours

Rich previews for links.

- [ ] **3.8.1** Link detection in messages
- [ ] **3.8.2** OG tag fetching (server-side):
  - Title
  - Description
  - Image
  - Site name
  
- [ ] **3.8.3** Embed rendering component
- [ ] **3.8.4** Image/video embeds
- [ ] **3.8.5** Caching (don't refetch every time)
- [ ] **3.8.6** Blocklist for malicious domains

**Deliverable:** Links show rich previews.

---

### 3.9 Frontend: Boxx & Chat UI
**Estimated effort:** 12-16 hours

- [ ] **3.9.1** Boxx sidebar:
  - User's boxxes list
  - Boxx icons
  - Unread indicators
  - Create boxx button

- [ ] **3.9.2** Channel sidebar:
  - Channel list for current boxx
  - Channel categories (optional)
  - Active channel highlight

- [ ] **3.9.3** Chat area:
  - Message list (virtualized for performance)
  - Message grouping by author
  - Timestamps
  - Load more on scroll up

- [ ] **3.9.4** Message composer:
  - Text input (auto-resize)
  - Emoji picker
  - Attachment upload
  - Send button (Enter to send)
  - Typing indicator display

- [ ] **3.9.5** Member sidebar:
  - Online members
  - Offline members
  - Role groups
  - Member count

- [ ] **3.9.6** Boxx settings modal:
  - Overview
  - Channels
  - Roles
  - Invites
  - Danger zone (delete)

**Deliverable:** Full chat UI.

---

### 3.10 Permissions System
**Estimated effort:** 6-8 hours

- [ ] **3.10.1** Permission bitfield:
```typescript
enum Permission {
  VIEW_CHANNELS     = 1 << 0,
  SEND_MESSAGES     = 1 << 1,
  MANAGE_MESSAGES   = 1 << 2,  // Delete others' messages
  MANAGE_CHANNELS   = 1 << 3,
  MANAGE_REALM      = 1 << 4,
  KICK_MEMBERS      = 1 << 5,
  BAN_MEMBERS       = 1 << 6,
  MANAGE_ROLES      = 1 << 7,
  ADMINISTRATOR     = 1 << 8,  // All permissions
}
```

- [ ] **3.10.2** Role-based permission checks
- [ ] **3.10.3** Channel-level permission overrides
- [ ] **3.10.4** Permission checking middleware
- [ ] **3.10.5** Owner always has full permissions

**Deliverable:** Role-based access control.

---

## Dependencies

**Depends on WS1:**
- Authentication
- Database
- Redis

**Depends on WS5:**
- Design system
- App shell layout

---

## Acceptance Criteria

- [ ] Users can create and join boxxes
- [ ] Boxxes have channels for organization
- [ ] Messages are delivered in real-time
- [ ] Message history is persisted and loadable
- [ ] Typing indicators work
- [ ] Presence (online/offline) is tracked
- [ ] DMs work for 1:1 and groups
- [ ] Reactions can be added to messages
- [ ] Links show embed previews
- [ ] Permissions control access

---

## Performance Considerations

- [ ] Message list virtualization (don't render 10k messages)
- [ ] Debounced typing indicators
- [ ] Efficient NATS subscription management
- [ ] Redis caching for presence
- [ ] Pagination for all list endpoints
- [ ] Connection pooling

---

## Files to Create

```
apps/api/src/
├── boxxes/
│   ├── boxxes.module.ts
│   ├── boxxes.controller.ts
│   ├── boxxes.service.ts
│   └── dto/
├── channels/
│   ├── channels.module.ts
│   ├── channels.controller.ts
│   └── channels.service.ts
├── messages/
│   ├── messages.module.ts
│   ├── messages.controller.ts
│   ├── messages.service.ts
│   └── messages.gateway.ts    # WebSocket gateway
├── dms/
│   ├── dms.module.ts
│   ├── dms.controller.ts
│   └── dms.service.ts
├── presence/
│   ├── presence.module.ts
│   ├── presence.service.ts
│   └── presence.gateway.ts
└── nats/
    ├── nats.module.ts
    └── nats.service.ts

apps/web/src/
├── app/
│   └── boxxes/
│       ├── page.tsx           # Boxx browser
│       └── [slug]/
│           └── page.tsx       # Boxx view
├── components/
│   └── chat/
│       ├── BoxxSidebar.tsx
│       ├── ChannelSidebar.tsx
│       ├── ChatArea.tsx
│       ├── MessageList.tsx
│       ├── Message.tsx
│       ├── MessageComposer.tsx
│       ├── MemberSidebar.tsx
│       ├── TypingIndicator.tsx
│       └── EmojiPicker.tsx
└── hooks/
    ├── useRealtime.ts
    ├── useMessages.ts
    └── usePresence.ts
```
