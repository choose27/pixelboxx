import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { formatNotification } from './templates/notification-templates';
import { UpdateNotificationPreferencesDto } from './dto/update-preferences.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    @Inject('NATS_CLIENT') private natsClient: ClientProxy,
  ) {}

  /**
   * Create a notification
   */
  async create(userId: string, type: NotificationType, data: any) {
    // Check user preferences
    const preferences = await this.getOrCreatePreferences(userId);

    // Check if user wants this type of notification
    if (!this.shouldSendNotification(type, preferences)) {
      return null;
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        data,
      },
    });

    // Format notification for display
    const formatted = {
      ...notification,
      ...formatNotification(type, data),
    };

    // Publish to NATS for real-time delivery
    await this.publishNotification(userId, formatted);

    return formatted;
  }

  /**
   * Publish notification via NATS
   */
  private async publishNotification(userId: string, notification: any) {
    const subject = `pixelboxx.users.${userId}.notifications`;
    this.natsClient.emit(subject, notification);
  }

  /**
   * Check if notification should be sent based on preferences
   */
  private shouldSendNotification(type: NotificationType, preferences: any): boolean {
    switch (type) {
      case NotificationType.FRIEND_REQUEST:
      case NotificationType.FRIEND_ACCEPTED:
        return preferences.friendRequests;
      case NotificationType.GUESTBOOK_ENTRY:
        return preferences.guestbookEntries;
      case NotificationType.MESSAGE_MENTION:
      case NotificationType.CHANNEL_MENTION:
        return preferences.mentions;
      case NotificationType.BOXX_INVITE:
        return preferences.boxxInvites;
      default:
        return true; // System notifications always sent
    }
  }

  /**
   * Get or create notification preferences
   */
  private async getOrCreatePreferences(userId: string) {
    let preferences = await this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await this.prisma.notificationPreferences.create({
        data: { userId },
      });
    }

    return preferences;
  }

  /**
   * List notifications (paginated)
   */
  async list(userId: string, page: number = 1, limit: number = 20, typeFilter?: NotificationType) {
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(typeFilter ? { type: typeFilter } : {}),
    };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    // Format notifications
    const formatted = notifications.map(n => ({
      ...n,
      ...formatNotification(n.type, n.data),
    }));

    return {
      notifications: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    return { count };
  }

  /**
   * Mark notification as read
   */
  async markRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return updated;
  }

  /**
   * Mark all notifications as read
   */
  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  }

  /**
   * Delete notification
   */
  async delete(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    return { success: true };
  }

  /**
   * Get notification preferences
   */
  async getPreferences(userId: string) {
    return this.getOrCreatePreferences(userId);
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(userId: string, dto: UpdateNotificationPreferencesDto) {
    const preferences = await this.prisma.notificationPreferences.upsert({
      where: { userId },
      update: dto,
      create: {
        userId,
        ...dto,
      },
    });

    return preferences;
  }
}
