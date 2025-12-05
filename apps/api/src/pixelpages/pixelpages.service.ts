import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { cssSanitizer } from '../common/css-sanitizer';
import { UpdatePixelPageDto } from './dto/update-pixelpage.dto';
import { UpdateCssDto } from './dto/update-css.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class PixelPagesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get public PixelPage by username
   */
  async getByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        pixelPage: {
          include: {
            sections: {
              where: { isVisible: true },
              orderBy: { position: 'asc' },
            },
            theme: true,
          },
        },
      },
    });

    if (!user || !user.pixelPage) {
      throw new NotFoundException('Profile not found');
    }

    if (!user.pixelPage.isPublic) {
      throw new ForbiddenException('This profile is private');
    }

    return {
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      pixelPage: user.pixelPage,
    };
  }

  /**
   * Get own PixelPage for editing (includes hidden sections)
   */
  async getOwnPage(userId: string) {
    let pixelPage = await this.prisma.pixelPage.findUnique({
      where: { userId },
      include: {
        sections: {
          orderBy: { position: 'asc' },
        },
        theme: true,
      },
    });

    // Create default PixelPage if doesn't exist
    if (!pixelPage) {
      pixelPage = await this.prisma.pixelPage.create({
        data: {
          userId,
          isPublic: true,
        },
        include: {
          sections: true,
          theme: true,
        },
      });
    }

    return pixelPage;
  }

  /**
   * Update PixelPage
   */
  async updatePage(userId: string, dto: UpdatePixelPageDto) {
    const page = await this.getOwnPage(userId);

    // Sanitize CSS if provided
    let sanitizedCss: string | undefined;
    let cssWarnings: string[] = [];

    if (dto.customCss !== undefined) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const sanitizeResult = cssSanitizer.sanitizeCSS(
        dto.customCss,
        user.username,
      );

      if (!sanitizeResult.success) {
        throw new BadRequestException({
          message: 'CSS sanitization failed',
          errors: sanitizeResult.removed,
        });
      }

      sanitizedCss = sanitizeResult.clean;
      cssWarnings = sanitizeResult.warnings;
    }

    const updated = await this.prisma.pixelPage.update({
      where: { id: page.id },
      data: {
        customCss: sanitizedCss,
        layoutJson: dto.layoutJson,
        bio: dto.bio,
        musicUrl: dto.musicUrl,
        themeId: dto.themeId,
        isPublic: dto.isPublic,
      },
      include: {
        sections: {
          orderBy: { position: 'asc' },
        },
        theme: true,
      },
    });

    return {
      page: updated,
      cssWarnings,
    };
  }

  /**
   * Update custom CSS only
   */
  async updateCss(userId: string, dto: UpdateCssDto) {
    const page = await this.getOwnPage(userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Sanitize CSS
    const sanitizeResult = cssSanitizer.sanitizeCSS(
      dto.customCss,
      user.username,
    );

    if (!sanitizeResult.success) {
      throw new BadRequestException({
        message: 'CSS sanitization failed',
        errors: sanitizeResult.removed,
      });
    }

    const updated = await this.prisma.pixelPage.update({
      where: { id: page.id },
      data: {
        customCss: sanitizeResult.clean,
      },
    });

    return {
      customCss: updated.customCss,
      warnings: sanitizeResult.warnings,
      removed: sanitizeResult.removed,
    };
  }

  /**
   * Add section to page
   */
  async createSection(userId: string, dto: CreateSectionDto) {
    const page = await this.getOwnPage(userId);

    // If position not provided, add to end
    if (dto.position === undefined) {
      const maxPosition = await this.prisma.pageSection.findFirst({
        where: { pageId: page.id },
        orderBy: { position: 'desc' },
        select: { position: true },
      });

      dto.position = maxPosition ? maxPosition.position + 1 : 0;
    }

    const section = await this.prisma.pageSection.create({
      data: {
        pageId: page.id,
        type: dto.type,
        content: dto.content,
        position: dto.position,
        isVisible: dto.isVisible ?? true,
      },
    });

    return section;
  }

  /**
   * Update section
   */
  async updateSection(
    userId: string,
    sectionId: string,
    dto: UpdateSectionDto,
  ) {
    const section = await this.prisma.pageSection.findUnique({
      where: { id: sectionId },
      include: { page: true },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    if (section.page.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this section');
    }

    const updated = await this.prisma.pageSection.update({
      where: { id: sectionId },
      data: {
        type: dto.type,
        content: dto.content,
        position: dto.position,
        isVisible: dto.isVisible,
      },
    });

    return updated;
  }

  /**
   * Delete section
   */
  async deleteSection(userId: string, sectionId: string) {
    const section = await this.prisma.pageSection.findUnique({
      where: { id: sectionId },
      include: { page: true },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    if (section.page.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this section');
    }

    await this.prisma.pageSection.delete({
      where: { id: sectionId },
    });

    return { success: true };
  }
}
