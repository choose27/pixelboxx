// @ts-nocheck
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
    // Note: PixelPage model not yet implemented in schema
    // For now, just return user profile without pixelPage
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('Profile not found');
    }

    // TODO: Once PixelPage model is added to schema, include it here
    return {
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      // pixelPage will be added by frontend as default until schema is updated
    };
  }

  /**
   * Get own PixelPage for editing (includes hidden sections)
   */
  async getOwnPage(userId: string) {
    // TODO: PixelPage model not yet implemented in schema
    // Return a default pixelPage structure for now
    return {
      id: 'default',
      userId,
      customCss: null,
      layoutJson: null,
      bio: null,
      musicUrl: null,
      themeId: null,
      isPublic: true,
      sections: [],
      theme: null,
    };
  }

  /**
   * Update PixelPage
   */
  async updatePage(userId: string, dto: UpdatePixelPageDto) {
    // TODO: PixelPage model not yet implemented
    // For now, just validate CSS and return success
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

      cssWarnings = sanitizeResult.warnings;
    }

    // Return mock page until schema is implemented
    const page = await this.getOwnPage(userId);
    return {
      page: {
        ...page,
        customCss: dto.customCss,
        layoutJson: dto.layoutJson,
        bio: dto.bio,
        musicUrl: dto.musicUrl,
        themeId: dto.themeId,
        isPublic: dto.isPublic ?? page.isPublic,
      },
      cssWarnings,
    };
  }

  /**
   * Update custom CSS only
   */
  async updateCss(userId: string, dto: UpdateCssDto) {
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

    // TODO: Save to database once PixelPage model is implemented
    return {
      customCss: sanitizeResult.clean,
      warnings: sanitizeResult.warnings,
      removed: sanitizeResult.removed,
    };
  }

  /**
   * Add section to page
   */
  async createSection(userId: string, dto: CreateSectionDto) {
    // TODO: PageSection model not yet implemented
    return {
      id: `section-${Date.now()}`,
      pageId: 'default',
      type: dto.type,
      content: dto.content,
      position: dto.position ?? 0,
      isVisible: dto.isVisible ?? true,
    };
  }

  /**
   * Update section
   */
  async updateSection(
    userId: string,
    sectionId: string,
    dto: UpdateSectionDto,
  ) {
    // TODO: PageSection model not yet implemented
    return {
      id: sectionId,
      pageId: 'default',
      type: dto.type,
      content: dto.content,
      position: dto.position,
      isVisible: dto.isVisible,
    };
  }

  /**
   * Delete section
   */
  async deleteSection(userId: string, sectionId: string) {
    // TODO: PageSection model not yet implemented
    return { success: true };
  }
}
