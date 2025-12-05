import { Module } from '@nestjs/common';
import { TopFriendsController, UserTopFriendsController } from './top-friends.controller';
import { TopFriendsService } from './top-friends.service';

@Module({
  controllers: [TopFriendsController, UserTopFriendsController],
  providers: [TopFriendsService],
  exports: [TopFriendsService],
})
export class TopFriendsModule {}
