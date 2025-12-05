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
import { FriendsService } from './friends.service';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  /**
   * Send a friend request
   * POST /friends/request/:userId
   */
  @Post('request/:userId')
  async sendRequest(@Request() req: any, @Param('userId') addresseeId: string) {
    return this.friendsService.sendRequest(req.user.userId, addresseeId);
  }

  /**
   * Accept a friend request
   * POST /friends/accept/:requestId
   */
  @Post('accept/:requestId')
  async acceptRequest(@Request() req: any, @Param('requestId') requestId: string) {
    return this.friendsService.acceptRequest(req.user.userId, requestId);
  }

  /**
   * Reject a friend request
   * POST /friends/reject/:requestId
   */
  @Post('reject/:requestId')
  async rejectRequest(@Request() req: any, @Param('requestId') requestId: string) {
    return this.friendsService.rejectRequest(req.user.userId, requestId);
  }

  /**
   * Remove a friend
   * DELETE /friends/:userId
   */
  @Delete(':userId')
  async removeFriend(@Request() req: any, @Param('userId') friendId: string) {
    return this.friendsService.removeFriend(req.user.userId, friendId);
  }

  /**
   * List your friends (accepted)
   * GET /friends
   */
  @Get()
  async listFriends(
    @Request() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.friendsService.listFriends(req.user.userId, page, limit);
  }

  /**
   * List incoming pending requests
   * GET /friends/requests
   */
  @Get('requests')
  async listIncomingRequests(
    @Request() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.friendsService.listIncomingRequests(req.user.userId, page, limit);
  }

  /**
   * List outgoing pending requests
   * GET /friends/requests/sent
   */
  @Get('requests/sent')
  async listSentRequests(
    @Request() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.friendsService.listSentRequests(req.user.userId, page, limit);
  }

  /**
   * Get friendship status with another user
   * GET /friends/status/:userId
   */
  @Get('status/:userId')
  async getFriendshipStatus(@Request() req: any, @Param('userId') otherUserId: string) {
    return this.friendsService.getFriendshipStatus(req.user.userId, otherUserId);
  }
}

/**
 * Public endpoints for viewing user's friends
 */
@Controller('users/:userId/friends')
export class UserFriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  /**
   * View a user's public friends list
   * GET /users/:userId/friends
   */
  @Get()
  async getUserFriends(
    @Param('userId') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.friendsService.getUserFriends(userId, undefined, page, limit);
  }
}
