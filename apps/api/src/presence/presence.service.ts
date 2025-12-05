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
  private redis: Redis | null = null;
  private readonly TTL = 300; // 5 minutes

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get('REDIS_URL');

    if (!redisUrl) {
      console.log('REDIS_URL not set - presence features disabled');
      return;
    }

    console.log(`Connecting to Redis: ${redisUrl.replace(/:[^:@]+@/, ':****@')}`);

    // Upstash requires TLS
    this.redis = new Redis(redisUrl, {
      tls: redisUrl.startsWith('rediss://') ? {} : undefined,
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      lazyConnect: true,
    });

    // Handle connection errors gracefully
    this.redis.on('error', (err) => {
      console.error('Redis connection error:', err.message);
    });

    try {
      await this.redis.connect();
      console.log('Successfully connected to Redis');
    } catch (err) {
      console.error('Failed to connect to Redis, presence features disabled:', err.message);
      this.redis = null;
    }
  }

  /**
   * Set user as online
   */
  async setOnline(userId: string, customStatus?: string): Promise<void> {
    if (!this.redis) return;

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
    if (!this.redis) return;

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
    if (!this.redis) return;

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
    if (!this.redis) {
      return { status: UserStatus.OFFLINE };
    }

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
    const onlineMap = new Map();

    if (!this.redis) {
      return onlineMap;
    }

    const pipeline = this.redis.pipeline();

    for (const userId of userIds) {
      pipeline.get(`presence:${userId}`);
    }

    const results = await pipeline.exec();

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
    if (!this.redis) return;

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
    if (!this.redis) return;

    const existing = await this.getStatus(userId);
    const data = {
      status: existing?.status || UserStatus.ONLINE,
      customStatus,
      lastSeen: new Date().toISOString(),
    };

    await this.redis.setex(`presence:${userId}`, this.TTL, JSON.stringify(data));
  }
}
