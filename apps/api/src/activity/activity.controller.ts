import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivityService } from './activity.service';

@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  /**
   * Get friends' activity feed
   * GET /activity/friends
   */
  @Get('friends')
  async getFriendsFeed(
    @Request() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.activityService.getFriendsFeed(req.user.userId, page, limit);
  }

  /**
   * Get own activity
   * GET /activity/me
   */
  @Get('me')
  async getMyActivity(
    @Request() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.activityService.getUserActivity(req.user.userId, page, limit);
  }

  /**
   * Get user's activity
   * GET /activity/users/:userId
   */
  @Get('users/:userId')
  async getUserActivity(
    @Param('userId') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.activityService.getUserActivity(userId, page, limit);
  }
}
