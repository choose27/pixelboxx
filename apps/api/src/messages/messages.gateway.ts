import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { NatsService } from '../nats/nats.service';
import { Subscription } from 'nats';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  subscriptions?: Map<string, Subscription>;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/ws',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private natsService: NatsService,
  ) {}

  /**
   * Handle new WebSocket connection with JWT authentication
   */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token =
        client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT
      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.subscriptions = new Map();

      console.log(`Client connected: ${client.id} (User: ${client.userId})`);
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      client.disconnect();
    }
  }

  /**
   * Handle client disconnect
   */
  async handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Client disconnected: ${client.id}`);

    // Unsubscribe from all NATS subjects
    if (client.subscriptions) {
      for (const [, subscription] of client.subscriptions) {
        await subscription.unsubscribe();
      }
      client.subscriptions.clear();
    }
  }

  /**
   * Subscribe to a channel's messages
   */
  @SubscribeMessage('subscribe-channel')
  async handleSubscribeChannel(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string },
  ) {
    if (!client.userId) return;

    try {
      // Verify user has access to this channel
      const channel = await this.prisma.channel.findUnique({
        where: { id: data.channelId },
        include: { boxx: true },
      });

      if (!channel) {
        client.emit('error', { message: 'Channel not found' });
        return;
      }

      // Verify membership
      const membership = await this.prisma.boxxMember.findUnique({
        where: {
          boxxId_userId: {
            boxxId: channel.boxxId,
            userId: client.userId,
          },
        },
      });

      if (!membership) {
        client.emit('error', { message: 'Not a member of this boxx' });
        return;
      }

      // Subscribe to NATS subject for this channel
      const subject = NatsService.subjects.channelMessage(channel.boxxId, data.channelId);

      // Unsubscribe from previous channel if any
      const existingKey = `channel:${data.channelId}`;
      const existingSub = client.subscriptions.get(existingKey);
      if (existingSub) {
        await existingSub.unsubscribe();
      }

      // Subscribe to new channel
      const subscription = await this.natsService.subscribe(subject, (message) => {
        client.emit('message', message);
      });

      client.subscriptions.set(existingKey, subscription);

      // Join Socket.IO room for channel
      client.join(`channel:${data.channelId}`);

      client.emit('subscribed', { channelId: data.channelId });
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      client.emit('error', { message: 'Failed to subscribe to channel' });
    }
  }

  /**
   * Unsubscribe from a channel
   */
  @SubscribeMessage('unsubscribe-channel')
  async handleUnsubscribeChannel(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string },
  ) {
    const key = `channel:${data.channelId}`;
    const subscription = client.subscriptions?.get(key);

    if (subscription) {
      await subscription.unsubscribe();
      client.subscriptions.delete(key);
    }

    client.leave(`channel:${data.channelId}`);
    client.emit('unsubscribed', { channelId: data.channelId });
  }

  /**
   * Handle typing indicator
   */
  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string; boxxId: string },
  ) {
    if (!client.userId) return;

    // Get user info
    const user = await this.prisma.user.findUnique({
      where: { id: client.userId },
      select: {
        id: true,
        username: true,
        displayName: true,
      },
    });

    // Broadcast typing indicator to channel
    const subject = NatsService.subjects.channelTyping(data.boxxId, data.channelId);
    await this.natsService.publish(subject, {
      userId: client.userId,
      username: user?.username,
      displayName: user?.displayName,
      timestamp: new Date().toISOString(),
    });

    // Also emit via Socket.IO to others in the channel room
    client.to(`channel:${data.channelId}`).emit('user-typing', {
      userId: client.userId,
      username: user?.username,
      displayName: user?.displayName,
    });
  }
}
