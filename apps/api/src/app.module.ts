import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PixelPagesModule } from './pixelpages/pixelpages.module';
import { ThemesModule } from './themes/themes.module';
import { GuestbookModule } from './guestbook/guestbook.module';
import { NatsModule } from './nats/nats.module';
import { BoxxesModule } from './boxxes/boxxes.module';
import { ChannelsModule } from './channels/channels.module';
import { MessagesModule } from './messages/messages.module';
import { PresenceModule } from './presence/presence.module';
import { AiServiceModule } from './ai-service/ai-service.module';
import { ModerationModule } from './moderation/moderation.module';
import { FriendsModule } from './friends/friends.module';
import { TopFriendsModule } from './top-friends/top-friends.module';
import { FollowersModule } from './followers/followers.module';
import { BlocksModule } from './blocks/blocks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ActivityModule } from './activity/activity.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    NatsModule,
    AuthModule,
    UsersModule,
    PixelPagesModule,
    ThemesModule,
    GuestbookModule,
    BoxxesModule,
    ChannelsModule,
    MessagesModule,
    PresenceModule,
    AiServiceModule,
    ModerationModule,
    // Social Graph & Notifications
    FriendsModule,
    TopFriendsModule,
    FollowersModule,
    BlocksModule,
    NotificationsModule,
    ActivityModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
