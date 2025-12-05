import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, NatsConnection, StringCodec, SubscriptionOptions } from 'nats';

@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
  private connection: NatsConnection;
  private codec = StringCodec();

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const natsUrl = this.configService.get('NATS_URL') || 'nats://localhost:4222';
    try {
      this.connection = await connect({
        servers: natsUrl,
        name: 'pixelboxx-api',
      });
      console.log(`Connected to NATS at ${natsUrl}`);
    } catch (error) {
      console.error('Failed to connect to NATS:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.connection?.drain();
  }

  /**
   * Publish a message to a subject
   */
  async publish(subject: string, data: any): Promise<void> {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    await this.connection.publish(subject, this.codec.encode(payload));
  }

  /**
   * Subscribe to a subject
   */
  async subscribe(
    subject: string,
    callback: (data: any) => void | Promise<void>,
    options?: SubscriptionOptions,
  ) {
    const sub = this.connection.subscribe(subject, options);

    (async () => {
      for await (const msg of sub) {
        const decoded = this.codec.decode(msg.data);
        try {
          const data = JSON.parse(decoded);
          await callback(data);
        } catch {
          await callback(decoded);
        }
      }
    })();

    return sub;
  }

  /**
   * Get the NATS connection for advanced usage
   */
  getConnection(): NatsConnection {
    return this.connection;
  }

  /**
   * Subject builders for consistency
   */
  static subjects = {
    // Message subjects
    channelMessage: (boxxId: string, channelId: string) =>
      `pixelboxx.boxxes.${boxxId}.channels.${channelId}.messages`,

    // Typing indicators
    channelTyping: (boxxId: string, channelId: string) =>
      `pixelboxx.boxxes.${boxxId}.typing.${channelId}`,

    // Presence
    userStatus: (userId: string) => `pixelboxx.presence.${userId}.status`,
    boxxPresence: (boxxId: string) => `pixelboxx.boxxes.${boxxId}.presence`,

    // Notifications
    userNotifications: (userId: string) => `pixelboxx.users.${userId}.notifications`,
  };
}
