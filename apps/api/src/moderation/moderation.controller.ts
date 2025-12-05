import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ModerationService } from './moderation.service';
import { ModerationStatus, Role } from '@prisma/client';

@Controller('moderation')
@UseGuards(JwtAuthGuard)
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  /**
   * GET /moderation/queue - Get pending moderation items (admin only)
   */
  @Get('queue')
  async getQueue(
    @Req() req: any,
    @Query('status') status?: ModerationStatus,
    @Query('limit') limit?: string,
  ) {
    // Check if user is admin or moderator
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.MOD) {
      throw new ForbiddenException('Admin or moderator access required');
    }

    return this.moderationService.getQueue(
      status,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  /**
   * PUT /moderation/:id/approve - Approve content (admin only)
   */
  @Put(':id/approve')
  async approve(@Req() req: any, @Param('id') id: string) {
    // Check if user is admin or moderator
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.MOD) {
      throw new ForbiddenException('Admin or moderator access required');
    }

    return this.moderationService.approve(id, req.user.id);
  }

  /**
   * PUT /moderation/:id/reject - Reject content (admin only)
   */
  @Put(':id/reject')
  async reject(
    @Req() req: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    // Check if user is admin or moderator
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.MOD) {
      throw new ForbiddenException('Admin or moderator access required');
    }

    return this.moderationService.reject(id, req.user.id, reason);
  }

  /**
   * PUT /moderation/:id/escalate - Escalate for review (admin only)
   */
  @Put(':id/escalate')
  async escalate(@Req() req: any, @Param('id') id: string) {
    // Check if user is admin or moderator
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.MOD) {
      throw new ForbiddenException('Admin or moderator access required');
    }

    return this.moderationService.escalate(id);
  }
}
