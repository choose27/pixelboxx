// @ts-nocheck
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { cssSanitizer } from '../common/css-sanitizer';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';

@Injectable()
export class ThemesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Browse public themes (paginated)
   */
  async findAll(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where = {
      isPublic: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [themes, total] = await Promise.all([
      this.prisma.theme.findMany({
        where,
        include: {
          creator: {
            select: {
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { useCount: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.theme.count({ where }),
    ]);

    return {
      themes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get theme details
   */
  async findOne(id: string) {
    const theme = await this.prisma.theme.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!theme) {
      throw new NotFoundException('Theme not found');
    }

    if (!theme.isPublic) {
      throw new ForbiddenException('This theme is private');
    }

    return theme;
  }

  /**
   * Create/publish theme from own profile
   */
  async create(userId: string, dto: CreateThemeDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Sanitize CSS
    const sanitizeResult = cssSanitizer.sanitizeCSS(dto.css, 'theme-preview');

    if (!sanitizeResult.success) {
      throw new BadRequestException({
        message: 'CSS sanitization failed',
        errors: sanitizeResult.removed,
      });
    }

    const theme = await this.prisma.theme.create({
      data: {
        creatorId: userId,
        name: dto.name,
        description: dto.description,
        css: sanitizeResult.clean,
        previewUrl: dto.previewUrl,
        isPublic: dto.isPublic ?? false,
      },
      include: {
        creator: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      theme,
      cssWarnings: sanitizeResult.warnings,
    };
  }

  /**
   * Update own theme
   */
  async update(userId: string, themeId: string, dto: UpdateThemeDto) {
    const theme = await this.prisma.theme.findUnique({
      where: { id: themeId },
    });

    if (!theme) {
      throw new NotFoundException('Theme not found');
    }

    if (theme.creatorId !== userId) {
      throw new ForbiddenException('Not authorized to update this theme');
    }

    // Sanitize CSS if provided
    let sanitizedCss: string | undefined;
    let cssWarnings: string[] = [];

    if (dto.css) {
      const sanitizeResult = cssSanitizer.sanitizeCSS(dto.css, 'theme-preview');

      if (!sanitizeResult.success) {
        throw new BadRequestException({
          message: 'CSS sanitization failed',
          errors: sanitizeResult.removed,
        });
      }

      sanitizedCss = sanitizeResult.clean;
      cssWarnings = sanitizeResult.warnings;
    }

    const updated = await this.prisma.theme.update({
      where: { id: themeId },
      data: {
        name: dto.name,
        description: dto.description,
        css: sanitizedCss,
        previewUrl: dto.previewUrl,
        isPublic: dto.isPublic,
      },
      include: {
        creator: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      theme: updated,
      cssWarnings,
    };
  }

  /**
   * Delete own theme
   */
  async delete(userId: string, themeId: string) {
    const theme = await this.prisma.theme.findUnique({
      where: { id: themeId },
    });

    if (!theme) {
      throw new NotFoundException('Theme not found');
    }

    if (theme.creatorId !== userId) {
      throw new ForbiddenException('Not authorized to delete this theme');
    }

    await this.prisma.theme.delete({
      where: { id: themeId },
    });

    return { success: true };
  }

  /**
   * Apply theme to profile (increment use count)
   */
  async useTheme(userId: string, themeId: string) {
    const theme = await this.findOne(themeId);

    // Update user's pixelPage to use this theme
    let pixelPage = await this.prisma.pixelPage.findUnique({
      where: { userId },
    });

    if (!pixelPage) {
      pixelPage = await this.prisma.pixelPage.create({
        data: {
          userId,
          themeId,
        },
      });
    } else {
      pixelPage = await this.prisma.pixelPage.update({
        where: { userId },
        data: { themeId },
      });
    }

    // Increment use count
    await this.prisma.theme.update({
      where: { id: themeId },
      data: {
        useCount: { increment: 1 },
      },
    });

    return {
      success: true,
      theme,
      pixelPage,
    };
  }
}
