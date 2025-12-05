import { Module } from '@nestjs/common';
import { FollowersController, UserFollowersController } from './followers.controller';
import { FollowersService } from './followers.service';

@Module({
  controllers: [FollowersController, UserFollowersController],
  providers: [FollowersService],
  exports: [FollowersService],
})
export class FollowersModule {}
