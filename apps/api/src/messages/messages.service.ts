import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NatsService } from '../nats/nats.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private natsService: NatsService,
  ) {}

  /**
   * Get message history for a channel (cursor-based pagination)
   */
  async findAll(
    channelId: string,
    limit = 50,
    before?: string,
    after?: string,
  ) {
    const whereClause: any = {
      channelId,
      isDeleted: false,
    };

    if (before) {
      const beforeMessage = await this.prisma.message.findUnique({
        where: { id: before },
      });
      if (beforeMessage) {
        whereClause.createdAt = { lt: beforeMessage.createdAt };
      }
    } else if (after) {
      const afterMessage = await this.prisma.message.findUnique({
        where: { id: after },
      });
      if (afterMessage) {
        whereClause.createdAt = { gt: afterMessage.createdAt };
      }
    }

    const messages = await this.prisma.message.findMany({
      where: whereClause,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        replyTo: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    // Reverse to get chronological order
    return messages.reverse();
  }

  /**
   * Get a single message
   */
  async findOne(messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        replyTo: true,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  /**
   * Create a new message and publish to NATS
   */
  async create(channelId: string, userId: string, dto: CreateMessageDto) {
    // Verify channel exists and user has access
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { boxx: true },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Verify user is a member
    const membership = await this.prisma.boxxMember.findUnique({
      where: {
        boxxId_userId: {
          boxxId: channel.boxxId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this boxx');
    }

    const message = await this.prisma.message.create({
      data: {
        channelId,
        authorId: userId,
        content: dto.content,
        attachments: dto.attachments,
        embeds: dto.embeds,
        replyToId: dto.replyToId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Publish to NATS for real-time delivery
    const subject = NatsService.subjects.channelMessage(channel.boxxId, channelId);
    await this.natsService.publish(subject, {
      type: 'message',
      data: message,
    });

    return message;
  }

  /**
   * Update a message
   */
  async update(messageId: string, userId: string, dto: UpdateMessageDto) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: { channel: { include: { boxx: true } } },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: dto.content,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Publish update to NATS
    const subject = NatsService.subjects.channelMessage(
      message.channel.boxxId,
      message.channelId,
    );
    await this.natsService.publish(subject, {
      type: 'message_update',
      data: updated,
    });

    return updated;
  }

  /**
   * Delete a message (soft delete)
   */
  async delete(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: { channel: { include: { boxx: true } } },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // User can delete their own messages, or boxx owner can delete any
    if (message.authorId !== userId && message.channel.boxx.ownerId !== userId) {
      throw new ForbiddenException('You cannot delete this message');
    }

    const deleted = await this.prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        content: '[deleted]',
      },
    });

    // Publish deletion to NATS
    const subject = NatsService.subjects.channelMessage(
      message.channel.boxxId,
      message.channelId,
    );
    await this.natsService.publish(subject, {
      type: 'message_delete',
      data: { id: messageId },
    });

    return deleted;
  }

  /**
   * Pin a message
   */
  async pin(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: { channel: { include: { boxx: true } } },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.channel.boxx.ownerId !== userId) {
      throw new ForbiddenException('Only the boxx owner can pin messages');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { isPinned: !message.isPinned },
    });
  }

  /**
   * Add a reaction to a message
   */
  async addReaction(messageId: string, userId: string, emoji: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if reaction already exists
    const existing = await this.prisma.reaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji,
        },
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.reaction.create({
      data: {
        messageId,
        userId,
        emoji,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  /**
   * Remove a reaction from a message
   */
  async removeReaction(messageId: string, userId: string, emoji: string) {
    const reaction = await this.prisma.reaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji,
        },
      },
    });

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    await this.prisma.reaction.delete({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji,
        },
      },
    });

    return { success: true };
  }
}
