import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export enum UserStatus {
  ONLINE = 'online',
  IDLE = 'idle',
  OFFLINE = 'offline',
}

@Injectable()
export class PresenceService implements OnModuleInit {
  private redis: Redis;
  private readonly TTL = 300; // 5 minutes

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get('REDIS_URL') || 'redis://localhost:6379';
    this.redis = new Redis(redisUrl);
    console.log(`Connected to Redis at ${redisUrl}`);
  }

  /**
   * Set user as online
   */
  async setOnline(userId: string, customStatus?: string): Promise<void> {
    const key = `presence:${userId}`;
    const data = {
      status: UserStatus.ONLINE,
      customStatus: customStatus || '',
      lastSeen: new Date().toISOString(),
    };

    await this.redis.setex(key, this.TTL, JSON.stringify(data));
  }

  /**
   * Set user as idle
   */
  async setIdle(userId: string): Promise<void> {
    const key = `presence:${userId}`;
    const existing = await this.getStatus(userId);

    const data = {
      status: UserStatus.IDLE,
      customStatus: existing?.customStatus || '',
      lastSeen: new Date().toISOString(),
    };

    await this.redis.setex(key, this.TTL, JSON.stringify(data));
  }

  /**
   * Set user as offline
   */
  async setOffline(userId: string): Promise<void> {
    const key = `presence:${userId}`;
    await this.redis.del(key);
  }

  /**
   * Get user's current status
   */
  async getStatus(userId: string): Promise<{
    status: UserStatus;
    customStatus?: string;
    lastSeen?: string;
  } | null> {
    const key = `presence:${userId}`;
    const data = await this.redis.get(key);

    if (!data) {
      return { status: UserStatus.OFFLINE };
    }

    return JSON.parse(data);
  }

  /**
   * Get online members in a boxx
   */
  async getOnlineMembers(userIds: string[]): Promise<Map<string, any>> {
    const pipeline = this.redis.pipeline();

    for (const userId of userIds) {
      pipeline.get(`presence:${userId}`);
    }

    const results = await pipeline.exec();
    const onlineMap = new Map();

    if (!results) {
      return onlineMap;
    }

    userIds.forEach((userId, index) => {
      const [err, data] = results[index];
      if (!err && data) {
        onlineMap.set(userId, JSON.parse(data as string));
      }
    });

    return onlineMap;
  }

  /**
   * Heartbeat to keep user online
   */
  async heartbeat(userId: string): Promise<void> {
    const key = `presence:${userId}`;
    const existing = await this.getStatus(userId);

    if (existing && existing.status !== UserStatus.OFFLINE) {
      await this.redis.expire(key, this.TTL);
    } else {
      await this.setOnline(userId);
    }
  }

  /**
   * Set custom status message
   */
  async setCustomStatus(userId: string, customStatus: string): Promise<void> {
    const existing = await this.getStatus(userId);
    const data = {
      status: existing?.status || UserStatus.ONLINE,
      customStatus,
      lastSeen: new Date().toISOString(),
    };

    await this.redis.setex(`presence:${userId}`, this.TTL, JSON.stringify(data));
  }
}
