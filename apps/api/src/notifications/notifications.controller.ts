import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { UpdateNotificationPreferencesDto } from './dto/update-preferences.dto';
import { NotificationType } from '@prisma/client';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * List notifications (paginated, with optional type filter)
   * GET /notifications
   */
  @Get()
  async list(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('type') type?: NotificationType,
  ) {
    return this.notificationsService.list(req.user.userId, page, limit, type);
  }

  /**
   * Get unread count
   * GET /notifications/unread-count
   */
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user.userId);
  }

  /**
   * Mark notification as read
   * POST /notifications/:id/read
   */
  @Post(':id/read')
  async markRead(@Request() req, @Param('id') notificationId: string) {
    return this.notificationsService.markRead(req.user.userId, notificationId);
  }

  /**
   * Mark all notifications as read
   * POST /notifications/read-all
   */
  @Post('read-all')
  async markAllRead(@Request() req) {
    return this.notificationsService.markAllRead(req.user.userId);
  }

  /**
   * Delete notification
   * DELETE /notifications/:id
   */
  @Delete(':id')
  async delete(@Request() req, @Param('id') notificationId: string) {
    return this.notificationsService.delete(req.user.userId, notificationId);
  }

  /**
   * Get notification preferences
   * GET /notifications/preferences
   */
  @Get('preferences')
  async getPreferences(@Request() req) {
    return this.notificationsService.getPreferences(req.user.userId);
  }

  /**
   * Update notification preferences
   * PUT /notifications/preferences
   */
  @Put('preferences')
  async updatePreferences(@Request() req, @Body() dto: UpdateNotificationPreferencesDto) {
    return this.notificationsService.updatePreferences(req.user.userId, dto);
  }
}
