import { Module } from '@nestjs/common';
import { FriendsController, UserFriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

@Module({
  controllers: [FriendsController, UserFriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}
