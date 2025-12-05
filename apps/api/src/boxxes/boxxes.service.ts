import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoxxDto } from './dto/create-boxx.dto';
import { UpdateBoxxDto } from './dto/update-boxx.dto';
import { CreateInviteDto } from './dto/create-invite.dto';

@Injectable()
export class BoxxesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a URL-friendly slug from a name
   */
  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Add random suffix to ensure uniqueness
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${base}-${suffix}`;
  }

  /**
   * Generate a random invite code
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Create a new boxx with default channels
   */
  async create(userId: string, dto: CreateBoxxDto) {
    const slug = this.generateSlug(dto.name);

    const boxx = await this.prisma.boxx.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        iconUrl: dto.iconUrl,
        bannerUrl: dto.bannerUrl,
        isPublic: dto.isPublic ?? true,
        ownerId: userId,
        memberCount: 1,
        members: {
          create: {
            userId,
          },
        },
        channels: {
          create: [
            {
              name: 'general',
              type: 'TEXT',
              position: 0,
              topic: 'General discussion',
            },
            {
              name: 'introductions',
              type: 'TEXT',
              position: 1,
              topic: 'Introduce yourself!',
            },
          ],
        },
      },
      include: {
        channels: true,
        members: {
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
        },
      },
    });

    return boxx;
  }

  /**
   * Find a boxx by slug
   */
  async findBySlug(slug: string, userId?: string) {
    const boxx = await this.prisma.boxx.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        channels: {
          orderBy: { position: 'asc' },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    if (!boxx) {
      throw new NotFoundException('Boxx not found');
    }

    // Check if user is a member (if userId provided)
    if (userId) {
      const membership = await this.prisma.boxxMember.findUnique({
        where: {
          boxxId_userId: {
            boxxId: boxx.id,
            userId,
          },
        },
      });

      return {
        ...boxx,
        isMember: !!membership,
        isOwner: boxx.ownerId === userId,
      };
    }

    return boxx;
  }

  /**
   * Update a boxx (owner only)
   */
  async update(boxxId: string, userId: string, dto: UpdateBoxxDto) {
    const boxx = await this.prisma.boxx.findUnique({
      where: { id: boxxId },
    });

    if (!boxx) {
      throw new NotFoundException('Boxx not found');
    }

    if (boxx.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can update this boxx');
    }

    return this.prisma.boxx.update({
      where: { id: boxxId },
      data: dto,
    });
  }

  /**
   * Delete a boxx (owner only)
   */
  async delete(boxxId: string, userId: string) {
    const boxx = await this.prisma.boxx.findUnique({
      where: { id: boxxId },
    });

    if (!boxx) {
      throw new NotFoundException('Boxx not found');
    }

    if (boxx.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can delete this boxx');
    }

    await this.prisma.boxx.delete({
      where: { id: boxxId },
    });

    return { success: true };
  }

  /**
   * Get all members of a boxx
   */
  async getMembers(boxxId: string) {
    const boxx = await this.prisma.boxx.findUnique({
      where: { id: boxxId },
    });

    if (!boxx) {
      throw new NotFoundException('Boxx not found');
    }

    return this.prisma.boxxMember.findMany({
      where: { boxxId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        role: true,
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });
  }

  /**
   * Join a public boxx
   */
  async join(boxxId: string, userId: string) {
    const boxx = await this.prisma.boxx.findUnique({
      where: { id: boxxId },
    });

    if (!boxx) {
      throw new NotFoundException('Boxx not found');
    }

    if (!boxx.isPublic) {
      throw new ForbiddenException('This boxx is private. Use an invite code to join.');
    }

    // Check if already a member
    const existing = await this.prisma.boxxMember.findUnique({
      where: {
        boxxId_userId: {
          boxxId,
          userId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('You are already a member of this boxx');
    }

    // Add member and increment count
    await this.prisma.$transaction([
      this.prisma.boxxMember.create({
        data: {
          boxxId,
          userId,
        },
      }),
      this.prisma.boxx.update({
        where: { id: boxxId },
        data: {
          memberCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return { success: true };
  }

  /**
   * Leave a boxx
   */
  async leave(boxxId: string, userId: string) {
    const boxx = await this.prisma.boxx.findUnique({
      where: { id: boxxId },
    });

    if (!boxx) {
      throw new NotFoundException('Boxx not found');
    }

    if (boxx.ownerId === userId) {
      throw new ForbiddenException('The owner cannot leave their own boxx');
    }

    const membership = await this.prisma.boxxMember.findUnique({
      where: {
        boxxId_userId: {
          boxxId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new BadRequestException('You are not a member of this boxx');
    }

    // Remove member and decrement count
    await this.prisma.$transaction([
      this.prisma.boxxMember.delete({
        where: {
          boxxId_userId: {
            boxxId,
            userId,
          },
        },
      }),
      this.prisma.boxx.update({
        where: { id: boxxId },
        data: {
          memberCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    return { success: true };
  }

  /**
   * Get all boxxes for a user
   */
  async getUserBoxxes(userId: string) {
    const memberships = await this.prisma.boxxMember.findMany({
      where: { userId },
      include: {
        boxx: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    return memberships.map((m) => ({
      ...m.boxx,
      isOwner: m.boxx.ownerId === userId,
      joinedAt: m.joinedAt,
    }));
  }

  /**
   * Create an invite for a boxx
   */
  async createInvite(boxxId: string, userId: string, dto: CreateInviteDto) {
    const boxx = await this.prisma.boxx.findUnique({
      where: { id: boxxId },
    });

    if (!boxx) {
      throw new NotFoundException('Boxx not found');
    }

    // Only members can create invites
    const membership = await this.prisma.boxxMember.findUnique({
      where: {
        boxxId_userId: {
          boxxId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You must be a member to create invites');
    }

    const code = this.generateInviteCode();

    return this.prisma.boxxInvite.create({
      data: {
        boxxId,
        code,
        creatorId: userId,
        maxUses: dto.maxUses,
        expiresAt: dto.expiresAt,
      },
    });
  }

  /**
   * Join a boxx using an invite code
   */
  async joinWithInvite(code: string, userId: string) {
    const invite = await this.prisma.boxxInvite.findUnique({
      where: { code },
      include: { boxx: true },
    });

    if (!invite) {
      throw new NotFoundException('Invalid invite code');
    }

    // Check if expired
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new BadRequestException('This invite has expired');
    }

    // Check if max uses reached
    if (invite.maxUses && invite.useCount >= invite.maxUses) {
      throw new BadRequestException('This invite has reached its maximum uses');
    }

    // Check if already a member
    const existing = await this.prisma.boxxMember.findUnique({
      where: {
        boxxId_userId: {
          boxxId: invite.boxxId,
          userId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('You are already a member of this boxx');
    }

    // Add member, increment counts
    await this.prisma.$transaction([
      this.prisma.boxxMember.create({
        data: {
          boxxId: invite.boxxId,
          userId,
        },
      }),
      this.prisma.boxx.update({
        where: { id: invite.boxxId },
        data: {
          memberCount: {
            increment: 1,
          },
        },
      }),
      this.prisma.boxxInvite.update({
        where: { code },
        data: {
          useCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return invite.boxx;
  }

  /**
   * List all public boxxes
   */
  async findAll(take = 50, skip = 0) {
    return this.prisma.boxx.findMany({
      where: { isPublic: true },
      take,
      skip,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: {
        memberCount: 'desc',
      },
    });
  }
}
