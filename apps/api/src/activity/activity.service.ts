import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityType, FriendshipStatus } from '@prisma/client';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create an activity entry
   */
  async create(userId: string, type: ActivityType, data: any) {
    const activity = await this.prisma.activity.create({
      data: {
        userId,
        type,
        data,
      },
    });

    return activity;
  }

  /**
   * Get activity feed for friends
   * Shows recent activities from the user's friends
   */
  async getFriendsFeed(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // Get user's friend IDs
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId, status: FriendshipStatus.ACCEPTED },
          { addresseeId: userId, status: FriendshipStatus.ACCEPTED },
        ],
      },
    });

    const friendIds = friendships.map(f =>
      f.requesterId === userId ? f.addresseeId : f.requesterId
    );

    // Get activities from friends
    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: {
          userId: { in: friendIds },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activity.count({
        where: {
          userId: { in: friendIds },
        },
      }),
    ]);

    // Format activities
    const formatted = activities.map(a => ({
      ...a,
      message: this.formatActivityMessage(a),
    }));

    return {
      activities: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user's own activity
   */
  async getUserActivity(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activity.count({ where: { userId } }),
    ]);

    const formatted = activities.map(a => ({
      ...a,
      message: this.formatActivityMessage(a),
    }));

    return {
      activities: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Format activity message for display
   */
  private formatActivityMessage(activity: any): string {
    const username = activity.user.displayName || activity.user.username;

    switch (activity.type) {
      case ActivityType.PROFILE_UPDATED:
        return `${username} updated their profile`;
      case ActivityType.PHOTOS_ADDED:
        return `${username} added ${activity.data.count || 'new'} photos`;
      case ActivityType.JOINED_BOXX:
        return `${username} joined ${activity.data.boxxName}`;
      case ActivityType.NEW_FRIEND:
        return `${username} became friends with ${activity.data.friendName}`;
      case ActivityType.TOP_FRIENDS_CHANGED:
        return `${username} updated their Top Friends`;
      case ActivityType.THEME_CHANGED:
        return `${username} changed their theme to "${activity.data.themeName}"`;
      default:
        return `${username} did something`;
    }
  }

  /**
   * Helper methods to create specific activity types
   */

  async profileUpdated(userId: string, changes: any) {
    return this.create(userId, ActivityType.PROFILE_UPDATED, { changes });
  }

  async photosAdded(userId: string, count: number) {
    return this.create(userId, ActivityType.PHOTOS_ADDED, { count });
  }

  async joinedBoxx(userId: string, boxxId: string, boxxName: string) {
    return this.create(userId, ActivityType.JOINED_BOXX, { boxxId, boxxName });
  }

  async newFriend(userId: string, friendId: string, friendName: string) {
    return this.create(userId, ActivityType.NEW_FRIEND, { friendId, friendName });
  }

  async topFriendsChanged(userId: string) {
    return this.create(userId, ActivityType.TOP_FRIENDS_CHANGED, {});
  }

  async themeChanged(userId: string, themeName: string) {
    return this.create(userId, ActivityType.THEME_CHANGED, { themeName });
  }
}
