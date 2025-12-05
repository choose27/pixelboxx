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
import { BlocksService } from './blocks.service';

@Controller('block')
@UseGuards(JwtAuthGuard)
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  /**
   * Block a user
   * POST /block/:userId
   */
  @Post(':userId')
  async block(@Request() req: any, @Param('userId') blockedId: string) {
    return this.blocksService.block(req.user.userId, blockedId);
  }

  /**
   * Unblock a user
   * DELETE /block/:userId
   */
  @Delete(':userId')
  async unblock(@Request() req: any, @Param('userId') blockedId: string) {
    return this.blocksService.unblock(req.user.userId, blockedId);
  }

  /**
   * List blocked users
   * GET /me/blocked
   */
  @Get('/me/blocked')
  async listBlocked(
    @Request() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.blocksService.listBlocked(req.user.userId, page, limit);
  }

  /**
   * Check if user is blocked
   * GET /block/check/:userId
   */
  @Get('check/:userId')
  async checkBlocked(@Request() req: any, @Param('userId') otherUserId: string) {
    const isBlocked = await this.blocksService.isBlocked(req.user.userId, otherUserId);
    const hasBlocked = await this.blocksService.hasBlocked(req.user.userId, otherUserId);

    return {
      isBlocked,
      hasBlocked,
    };
  }
}
