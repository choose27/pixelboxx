import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TopFriendsService } from './top-friends.service';
import { UpdateTopFriendsDto } from './dto/update-top-friends.dto';

@Controller('me/top-friends')
@UseGuards(JwtAuthGuard)
export class TopFriendsController {
  constructor(private readonly topFriendsService: TopFriendsService) {}

  /**
   * Get your Top 8
   * GET /me/top-friends
   */
  @Get()
  async getTopFriends(@Request() req) {
    return this.topFriendsService.getTopFriends(req.user.userId);
  }

  /**
   * Get who has YOU in their Top Friends (vanity!)
   * GET /me/top-friends/featured-in
   */
  @Get('featured-in')
  async getTopFriendOf(@Request() req) {
    return this.topFriendsService.getTopFriendOf(req.user.userId);
  }

  /**
   * Update Top Friends rankings (batch update)
   * PUT /me/top-friends
   */
  @Put()
  async updateTopFriends(@Request() req, @Body() dto: UpdateTopFriendsDto) {
    return this.topFriendsService.updateTopFriends(req.user.userId, dto);
  }

  /**
   * Remove from specific position
   * DELETE /me/top-friends/:position
   */
  @Delete(':position')
  async removeFromPosition(
    @Request() req,
    @Param('position', ParseIntPipe) position: number,
  ) {
    return this.topFriendsService.removeFromPosition(req.user.userId, position);
  }
}

/**
 * Public endpoints for viewing user's Top Friends
 */
@Controller('users/:userId/top-friends')
export class UserTopFriendsController {
  constructor(private readonly topFriendsService: TopFriendsService) {}

  /**
   * View a user's public Top Friends
   * GET /users/:userId/top-friends
   */
  @Get()
  async getUserTopFriends(@Param('userId') userId: string) {
    return this.topFriendsService.getUserTopFriends(userId);
  }
}
