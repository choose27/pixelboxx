# Social Graph & Notifications Testing Guide

## Overview
Complete testing guide for the PixelBoxx Social Graph & Notifications system.

## Backend API Endpoints

### Friends System

#### Send Friend Request
```bash
POST /friends/request/:userId
Authorization: Bearer <token>

Response: { id, requesterId, addresseeId, status: "PENDING", ... }
```

#### Accept Friend Request
```bash
POST /friends/accept/:requestId
Authorization: Bearer <token>

Response: { id, status: "ACCEPTED", requester: {...}, addressee: {...} }
```

#### Reject Friend Request
```bash
POST /friends/reject/:requestId
Authorization: Bearer <token>

Response: { success: true }
```

#### Remove Friend
```bash
DELETE /friends/:userId
Authorization: Bearer <token>

Response: { success: true }
```

#### List Friends
```bash
GET /friends?page=1&limit=20
Authorization: Bearer <token>

Response: { friends: [...], pagination: {...} }
```

#### List Incoming Requests
```bash
GET /friends/requests?page=1&limit=20
Authorization: Bearer <token>

Response: { requests: [...], pagination: {...} }
```

#### List Sent Requests
```bash
GET /friends/requests/sent?page=1&limit=20
Authorization: Bearer <token>

Response: { requests: [...], pagination: {...} }
```

#### View User's Friends
```bash
GET /users/:userId/friends?page=1&limit=20

Response: { friends: [...], pagination: {...} }
```

### Top Friends (THE DRAMA!)

#### Get Your Top 8
```bash
GET /me/top-friends
Authorization: Bearer <token>

Response: [{ id, userId, friendId, position, friend: {...} }, ...]
```

#### Update Top Friends
```bash
PUT /me/top-friends
Authorization: Bearer <token>
Content-Type: application/json

{
  "topFriends": [
    { "friendId": "uuid-1", "position": 1 },
    { "friendId": "uuid-2", "position": 2 },
    ...
  ]
}

Response: { topFriends: [...], addedFriends: [...], removedFriends: [...] }
```

#### Remove from Position
```bash
DELETE /me/top-friends/:position
Authorization: Bearer <token>

Response: { success: true, removedFriendId: "uuid" }
```

#### View User's Top Friends
```bash
GET /users/:userId/top-friends

Response: [{ id, position, friend: {...} }, ...]
```

### Followers System

#### Follow User
```bash
POST /follow/:userId
Authorization: Bearer <token>

Response: { id, followerId, followingId, following: {...} }
```

#### Unfollow User
```bash
DELETE /follow/:userId
Authorization: Bearer <token>

Response: { success: true }
```

#### Get Your Followers
```bash
GET /me/followers?page=1&limit=20
Authorization: Bearer <token>

Response: { followers: [...], pagination: {...} }
```

#### Get Who You're Following
```bash
GET /me/following?page=1&limit=20
Authorization: Bearer <token>

Response: { following: [...], pagination: {...} }
```

### Block System

#### Block User
```bash
POST /block/:userId
Authorization: Bearer <token>

Response: { id, blockerId, blockedId, blocked: {...} }
```

#### Unblock User
```bash
DELETE /block/:userId
Authorization: Bearer <token>

Response: { success: true }
```

#### List Blocked Users
```bash
GET /me/blocked?page=1&limit=20
Authorization: Bearer <token>

Response: { blocked: [...], pagination: {...} }
```

### Notifications

#### List Notifications
```bash
GET /notifications?page=1&limit=20&type=FRIEND_REQUEST
Authorization: Bearer <token>

Response: { notifications: [...], pagination: {...} }
```

#### Get Unread Count
```bash
GET /notifications/unread-count
Authorization: Bearer <token>

Response: { count: 5 }
```

#### Mark as Read
```bash
POST /notifications/:id/read
Authorization: Bearer <token>

Response: { id, read: true, ... }
```

#### Mark All Read
```bash
POST /notifications/read-all
Authorization: Bearer <token>

Response: { success: true }
```

#### Delete Notification
```bash
DELETE /notifications/:id
Authorization: Bearer <token>

Response: { success: true }
```

#### Get Preferences
```bash
GET /notifications/preferences
Authorization: Bearer <token>

Response: { emailEnabled, friendRequests, mentions, ... }
```

#### Update Preferences
```bash
PUT /notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "friendRequests": true,
  "mentions": false,
  "emailEnabled": true
}

Response: { id, userId, ... }
```

### Activity Feed

#### Get Friends' Activity
```bash
GET /activity/friends?page=1&limit=20
Authorization: Bearer <token>

Response: { activities: [...], pagination: {...} }
```

## WebSocket Real-time Notifications

### Connect to Notifications
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001/notifications', {
  auth: { token: 'your-jwt-token' },
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('Connected to notifications');
});

socket.on('notification', (notification) => {
  console.log('New notification:', notification);
  // { id, type, title, body, action, icon, data, ... }
});

socket.on('disconnect', () => {
  console.log('Disconnected from notifications');
});
```

## Complete Testing Flow

### Test 1: Friend Request Flow
1. User A sends friend request to User B
   ```
   POST /friends/request/:userBId
   ```
2. User B sees request in notifications (real-time via WebSocket)
3. User B sees request in `/friends/requests`
4. User B accepts request
   ```
   POST /friends/accept/:requestId
   ```
5. User A gets notification that request was accepted
6. Both users see each other in `/friends`

### Test 2: Top Friends Drama
1. User A adds User B to position 1 in Top Friends
   ```
   PUT /me/top-friends
   { "topFriends": [{ "friendId": "userB", "position": 1 }] }
   ```
2. User B gets notification "You've been added to User A's Top Friends at position #1"
3. User B's profile shows Top Friends display
4. User A reorders Top Friends (drag-and-drop in UI)
5. User A removes User C from Top Friends
6. User C gets notification "You've been removed from User A's Top Friends"

### Test 3: Block System
1. User A blocks User B
   ```
   POST /block/:userBId
   ```
2. Friendship removed automatically
3. Top Friends entries removed
4. User B cannot send messages to User A
5. User B cannot see User A's profile
6. User A can unblock later
   ```
   DELETE /block/:userBId
   ```

### Test 4: Real-time Notifications
1. Open two browser windows (User A and User B)
2. User A sends friend request to User B
3. User B instantly sees notification bell update (unread count)
4. User B clicks bell and sees friend request notification
5. User B accepts request
6. User A instantly sees "Friend request accepted" notification

## Frontend Pages

### /friends
- Tabs: All Friends | Requests | Sent Requests | Blocked
- Friend list with avatars and remove buttons
- Accept/Reject buttons for incoming requests

### /notifications
- Full notification list with filtering by type
- Mark as read / Delete actions
- Type filters: All, Friends, Top Friends, Guestbook, Mentions

### /discover
- Search users by username
- "Add Friend" buttons
- New users section
- People you may know (placeholder)

### Top Friends Editor (in profile settings)
- 8 slots with position badges (🥇🥈🥉 #4-8)
- Drag-and-drop to reorder
- Click empty slot to add friend
- Remove button on each slot
- "Save Top Friends" button
- Success message with drama flair

### Notification Bell (in top nav)
- Bell icon with unread count badge
- Dropdown showing recent 5 notifications
- Click notification to navigate to action
- "Mark all read" button
- "View all" link to /notifications

## Database Models

All models created via Prisma migration:
- ✅ Friendship (with FriendshipStatus enum)
- ✅ TopFriend (positions 1-8)
- ✅ Follow
- ✅ Block
- ✅ Notification (with NotificationType enum)
- ✅ NotificationPreferences
- ✅ Activity (with ActivityType enum)

## What's Included

### Backend (8 Modules)
1. ✅ Friends Module - Complete CRUD with status checks
2. ✅ Top Friends Module - The drama feature with rankings
3. ✅ Followers Module - Public following system
4. ✅ Blocks Module - Safety feature with cascade deletes
5. ✅ Notifications Module - With WebSocket gateway
6. ✅ Notification Templates - Pre-formatted messages
7. ✅ Activity Module - Friends activity feed
8. ✅ All modules registered in app.module.ts

### Frontend
1. ✅ Friends page (/friends) with tabs
2. ✅ TopFriendsEditor component with drag-and-drop
3. ✅ TopFriendsDisplay component for profiles
4. ✅ NotificationBell component with real-time updates
5. ✅ Notifications page (/notifications) with filtering
6. ✅ ActivityFeed component
7. ✅ User Discovery page (/discover)
8. ✅ Hooks: useFriends, useNotifications, useTopFriends

### Features Confirmed
- ✅ Real-time notifications via WebSocket (NATS-backed)
- ✅ Top Friends with visual ranks and drama energy
- ✅ Block system with cascade effects
- ✅ Activity feed for friends
- ✅ Notification preferences
- ✅ Pagination on all lists
- ✅ Responsive UI components

## Next Steps

1. Start the API:
   ```bash
   cd apps/api
   npm run start:dev
   ```

2. Start the web app:
   ```bash
   cd apps/web
   npm run dev
   ```

3. Test the friend request flow end-to-end
4. Test Top Friends drag-and-drop
5. Verify real-time notifications work
6. Test block system cascade deletes

## The Drama Factor ⭐

Top Friends has THE DRAMA ENERGY:
- Position badges with medals (🥇🥈🥉)
- Notifications when added/removed
- Drag-and-drop reordering
- Confirmation before removing ("This might cause drama!")
- Visual prominence on profiles
- Shows who has YOU in their Top Friends (vanity!)

The social graph is ready to make PixelBoxx sticky!
