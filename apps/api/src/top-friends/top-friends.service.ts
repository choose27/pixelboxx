import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FriendshipStatus } from '@prisma/client';
import { UpdateTopFriendsDto } from './dto/update-top-friends.dto';

@Injectable()
export class TopFriendsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get user's Top 8 friends
   */
  async getTopFriends(userId: string) {
    const topFriends = await this.prisma.topFriend.findMany({
      where: { userId },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    });

    return topFriends;
  }

  /**
   * Get who has this user in their Top Friends (vanity feature!)
   */
  async getTopFriendOf(userId: string) {
    const topFriendOf = await this.prisma.topFriend.findMany({
      where: { friendId: userId },
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
    });

    return topFriendOf;
  }

  /**
   * Update Top Friends (batch update)
   * THE DRAMA FEATURE - positions 1-8
   */
  async updateTopFriends(userId: string, dto: UpdateTopFriendsDto) {
    // Validate all friends are actual friends
    const friendIds = dto.topFriends.map(tf => tf.friendId);

    if (friendIds.length > 0) {
      const friendships = await this.prisma.friendship.findMany({
        where: {
          OR: [
            { requesterId: userId, addresseeId: { in: friendIds }, status: FriendshipStatus.ACCEPTED },
            { addresseeId: userId, requesterId: { in: friendIds }, status: FriendshipStatus.ACCEPTED },
          ],
        },
      });

      const validFriendIds = new Set(
        friendships.map(f => f.requesterId === userId ? f.addresseeId : f.requesterId)
      );

      const invalidFriends = friendIds.filter(id => !validFriendIds.has(id));
      if (invalidFriends.length > 0) {
        throw new BadRequestException('Can only add friends to Top Friends');
      }
    }

    // Check for duplicate positions
    const positions = dto.topFriends.map(tf => tf.position);
    const uniquePositions = new Set(positions);
    if (positions.length !== uniquePositions.size) {
      throw new BadRequestException('Duplicate positions not allowed');
    }

    // Check for duplicate friend IDs
    const uniqueFriendIds = new Set(friendIds);
    if (friendIds.length !== uniqueFriendIds.size) {
      throw new BadRequestException('Cannot add same friend multiple times');
    }

    // Get previous top friends to detect removals and additions
    const previousTopFriends = await this.prisma.topFriend.findMany({
      where: { userId },
    });

    const previousFriendIds = new Set(previousTopFriends.map(tf => tf.friendId));
    const newFriendIds = new Set(friendIds);

    const addedFriends = friendIds.filter(id => !previousFriendIds.has(id));
    const removedFriends = previousTopFriends
      .map(tf => tf.friendId)
      .filter(id => !newFriendIds.has(id));

    // Delete all existing top friends
    await this.prisma.topFriend.deleteMany({
      where: { userId },
    });

    // Create new top friends
    if (dto.topFriends.length > 0) {
      await this.prisma.topFriend.createMany({
        data: dto.topFriends.map(tf => ({
          userId,
          friendId: tf.friendId,
          position: tf.position,
        })),
      });
    }

    // Return updated list
    const updated = await this.getTopFriends(userId);

    return {
      topFriends: updated,
      addedFriends,
      removedFriends,
    };
  }

  /**
   * Remove someone from a specific position
   */
  async removeFromPosition(userId: string, position: number) {
    if (position < 1 || position > 8) {
      throw new BadRequestException('Position must be between 1 and 8');
    }

    const topFriend = await this.prisma.topFriend.findUnique({
      where: {
        userId_position: {
          userId,
          position,
        },
      },
    });

    if (!topFriend) {
      throw new NotFoundException('No friend at this position');
    }

    await this.prisma.topFriend.delete({
      where: {
        userId_position: {
          userId,
          position,
        },
      },
    });

    return { success: true, removedFriendId: topFriend.friendId };
  }

  /**
   * Get a user's public Top Friends display
   */
  async getUserTopFriends(targetUserId: string) {
    return this.getTopFriends(targetUserId);
  }
}
