import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModerationService } from '../moderation/moderation.service';
import { CreateGuestbookEntryDto } from './dto/create-guestbook-entry.dto';
import { ContentType } from '@prisma/client';

@Injectable()
export class GuestbookService {
  private readonly logger = new Logger(GuestbookService.name);

  constructor(
    private prisma: PrismaService,
    private moderationService: ModerationService,
  ) {}

  /**
   * List guestbook entries for a profile (paginated)
   */
  async findAll(
    username: string,
    page: number = 1,
    limit: number = 20,
    includeHidden: boolean = false,
  ) {
    const skip = (page - 1) * limit;

    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { pixelPage: true },
    });

    if (!user || !user.pixelPage) {
      throw new NotFoundException('Profile not found');
    }

    const where = {
      pageId: user.pixelPage.id,
      ...(includeHidden ? {} : { isHidden: false }),
    };

    const [entries, total] = await Promise.all([
      this.prisma.guestbookEntry.findMany({
        where,
        include: {
          author: {
            select: {
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
      this.prisma.guestbookEntry.count({ where }),
    ]);

    return {
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Leave a guestbook entry
   */
  async create(username: string, authorId: string, dto: CreateGuestbookEntryDto) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { pixelPage: true },
    });

    if (!user || !user.pixelPage) {
      throw new NotFoundException('Profile not found');
    }

    if (!user.pixelPage.isPublic) {
      throw new ForbiddenException('Cannot leave entries on private profiles');
    }

    const entry = await this.prisma.guestbookEntry.create({
      data: {
        pageId: user.pixelPage.id,
        pageOwnerId: user.id,
        authorId,
        content: dto.content,
      },
      include: {
        author: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // TODO: Moderate guestbook entry content
    // For now, auto-approve (placeholder)
    try {
      await this.moderationService.moderateText(
        dto.content,
        ContentType.GUESTBOOK,
        entry.id,
        authorId,
      );
      this.logger.log(`Guestbook entry ${entry.id} queued for moderation (auto-approved)`);
    } catch (error) {
      this.logger.error('Failed to queue guestbook entry for moderation:', error);
      // Don't block entry creation if moderation fails
    }

    return entry;
  }

  /**
   * Delete own entry
   */
  async delete(userId: string, entryId: string) {
    const entry = await this.prisma.guestbookEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    if (entry.authorId !== userId) {
      throw new ForbiddenException('Not authorized to delete this entry');
    }

    await this.prisma.guestbookEntry.delete({
      where: { id: entryId },
    });

    return { success: true };
  }

  /**
   * Hide/unhide entry (owner only)
   */
  async toggleHidden(userId: string, entryId: string) {
    const entry = await this.prisma.guestbookEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    if (entry.pageOwnerId !== userId) {
      throw new ForbiddenException('Not authorized to hide this entry');
    }

    const updated = await this.prisma.guestbookEntry.update({
      where: { id: entryId },
      data: {
        isHidden: !entry.isHidden,
      },
    });

    return updated;
  }
}
