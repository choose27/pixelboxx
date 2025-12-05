import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiServiceService } from '../ai-service/ai-service.service';
import { ContentType, ModerationStatus } from '@prisma/client';

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiServiceService,
  ) {}

  /**
   * Queue content for moderation
   */
  async queueForModeration(
    contentType: ContentType,
    contentId: string,
    userId: string,
  ) {
    const queueEntry = await this.prisma.moderationQueue.create({
      data: {
        contentType,
        contentId,
        userId,
        status: ModerationStatus.PENDING,
      },
    });

    this.logger.log(
      `Queued ${contentType} (${contentId}) for moderation`,
    );

    return queueEntry;
  }

  /**
   * Moderate image content
   * Currently auto-approves - TODO: Implement actual AI moderation
   */
  async moderateImage(
    imageBuffer: Buffer,
    contentId: string,
    userId: string,
  ) {
    // Queue for moderation
    const queueEntry = await this.queueForModeration(
      ContentType.PROFILE_IMAGE,
      contentId,
      userId,
    );

    // Call AI moderation service (placeholder - auto-approves)
    const moderationResult = await this.aiService.moderateImage(imageBuffer);

    // Update queue entry with result
    await this.prisma.moderationQueue.update({
      where: { id: queueEntry.id },
      data: {
        status: moderationResult.action === 'approve'
          ? ModerationStatus.APPROVED
          : moderationResult.action === 'reject'
          ? ModerationStatus.REJECTED
          : ModerationStatus.PENDING,
        aiScore: moderationResult.score,
        aiReason: moderationResult.reason,
      },
    });

    return moderationResult;
  }

  /**
   * Moderate text content
   * Currently auto-approves - TODO: Implement actual AI moderation
   */
  async moderateText(
    content: string,
    contentType: ContentType,
    contentId: string,
    userId: string,
  ) {
    // Queue for moderation
    const queueEntry = await this.queueForModeration(
      contentType,
      contentId,
      userId,
    );

    // Call AI moderation service (placeholder - auto-approves)
    const moderationResult = await this.aiService.moderateText(content);

    // Update queue entry with result
    await this.prisma.moderationQueue.update({
      where: { id: queueEntry.id },
      data: {
        status: moderationResult.action === 'approve'
          ? ModerationStatus.APPROVED
          : moderationResult.action === 'reject'
          ? ModerationStatus.REJECTED
          : ModerationStatus.PENDING,
        aiScore: moderationResult.score,
        aiReason: moderationResult.reason,
      },
    });

    return moderationResult;
  }

  /**
   * Get moderation queue (admin only)
   */
  async getQueue(status?: ModerationStatus, limit = 50) {
    return this.prisma.moderationQueue.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Approve content (admin only)
   */
  async approve(id: string, reviewerId: string) {
    return this.prisma.moderationQueue.update({
      where: { id },
      data: {
        status: ModerationStatus.APPROVED,
        reviewerId,
        reviewedAt: new Date(),
      },
    });
  }

  /**
   * Reject content (admin only)
   */
  async reject(id: string, reviewerId: string, reason?: string) {
    return this.prisma.moderationQueue.update({
      where: { id },
      data: {
        status: ModerationStatus.REJECTED,
        reviewerId,
        reviewedAt: new Date(),
        aiReason: reason,
      },
    });
  }

  /**
   * Escalate for manual review (admin only)
   */
  async escalate(id: string) {
    return this.prisma.moderationQueue.update({
      where: { id },
      data: {
        status: ModerationStatus.ESCALATED,
      },
    });
  }
}
