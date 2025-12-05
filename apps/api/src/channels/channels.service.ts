import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Injectable()
export class ChannelsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new channel in a boxx
   */
  async create(boxxId: string, userId: string, dto: CreateChannelDto) {
    const boxx = await this.prisma.boxx.findUnique({
      where: { id: boxxId },
    });

    if (!boxx) {
      throw new NotFoundException('Boxx not found');
    }

    // Check if user is the owner
    if (boxx.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can create channels');
    }

    // Get the highest position to add at the end
    const lastChannel = await this.prisma.channel.findFirst({
      where: { boxxId },
      orderBy: { position: 'desc' },
    });

    return this.prisma.channel.create({
      data: {
        boxxId,
        name: dto.name,
        topic: dto.topic,
        type: dto.type || 'TEXT',
        position: (lastChannel?.position ?? -1) + 1,
      },
    });
  }

  /**
   * Get all channels in a boxx
   */
  async findAll(boxxId: string) {
    return this.prisma.channel.findMany({
      where: { boxxId },
      orderBy: { position: 'asc' },
    });
  }

  /**
   * Update a channel
   */
  async update(channelId: string, userId: string, dto: UpdateChannelDto) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { boxx: true },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    if (channel.boxx.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can update channels');
    }

    return this.prisma.channel.update({
      where: { id: channelId },
      data: dto,
    });
  }

  /**
   * Delete a channel
   */
  async delete(channelId: string, userId: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { boxx: true },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    if (channel.boxx.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can delete channels');
    }

    await this.prisma.channel.delete({
      where: { id: channelId },
    });

    return { success: true };
  }

  /**
   * Reorder a channel
   */
  async updatePosition(channelId: string, userId: string, position: number) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { boxx: true },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    if (channel.boxx.ownerId !== userId) {
      throw new ForbiddenException('Only the owner can reorder channels');
    }

    return this.prisma.channel.update({
      where: { id: channelId },
      data: { position },
    });
  }
}
