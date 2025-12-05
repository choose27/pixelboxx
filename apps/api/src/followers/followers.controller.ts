import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FollowersService } from './followers.service';

@Controller('follow')
@UseGuards(JwtAuthGuard)
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  /**
   * Follow a user
   * POST /follow/:userId
   */
  @Post(':userId')
  async follow(@Request() req, @Param('userId') followingId: string) {
    return this.followersService.follow(req.user.userId, followingId);
  }

  /**
   * Unfollow a user
   * DELETE /follow/:userId
   */
  @Delete(':userId')
  async unfollow(@Request() req, @Param('userId') followingId: string) {
    return this.followersService.unfollow(req.user.userId, followingId);
  }

  /**
   * Get your followers
   * GET /me/followers
   */
  @Get('/me/followers')
  async getMyFollowers(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.followersService.getFollowers(req.user.userId, page, limit);
  }

  /**
   * Get who you're following
   * GET /me/following
   */
  @Get('/me/following')
  async getMyFollowing(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.followersService.getFollowing(req.user.userId, page, limit);
  }

  /**
   * Get your follower/following counts
   * GET /me/follow-stats
   */
  @Get('/me/follow-stats')
  async getMyFollowStats(@Request() req) {
    return this.followersService.getCounts(req.user.userId);
  }
}

/**
 * Public endpoints for viewing user's followers/following
 */
@Controller('users/:userId')
export class UserFollowersController {
  constructor(private readonly followersService: FollowersService) {}

  /**
   * View a user's followers
   * GET /users/:userId/followers
   */
  @Get('followers')
  async getUserFollowers(
    @Param('userId') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.followersService.getFollowers(userId, page, limit);
  }

  /**
   * View who a user is following
   * GET /users/:userId/following
   */
  @Get('following')
  async getUserFollowing(
    @Param('userId') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.followersService.getFollowing(userId, page, limit);
  }

  /**
   * Get user's follower/following counts
   * GET /users/:userId/follow-stats
   */
  @Get('follow-stats')
  async getUserFollowStats(@Param('userId') userId: string) {
    return this.followersService.getCounts(userId);
  }
}
