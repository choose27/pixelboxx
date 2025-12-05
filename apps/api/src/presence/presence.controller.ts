import { Controller, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PresenceService } from './presence.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthRequest } from '../types/request.interface';

@Controller('presence')
@UseGuards(JwtAuthGuard)
export class PresenceController {
  constructor(
    private presenceService: PresenceService,
    private prisma: PrismaService,
  ) {}

  @Get('boxxes/:boxxId/online')
  async getOnlineMembers(@Param('boxxId') boxxId: string) {
    // Get all members of the boxx
    const members = await this.prisma.boxxMember.findMany({
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
      },
    });

    // Get presence for all members
    const userIds = members.map((m) => m.userId);
    const presenceMap = await this.presenceService.getOnlineMembers(userIds);

    // Combine member info with presence
    return members.map((member) => ({
      ...member.user,
      presence: presenceMap.get(member.userId) || { status: 'offline' },
    }));
  }

  @Put('me/status')
  async setStatus(@Request() req: AuthRequest, @Body() body: { customStatus: string }) {
    await this.presenceService.setCustomStatus(req.user.id, body.customStatus);
    return { success: true };
  }

  @Get('users/:userId')
  async getUserStatus(@Param('userId') userId: string) {
    return this.presenceService.getStatus(userId);
  }
}
