import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { NatsService } from '../nats/nats.service';

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map();
  private natsSubscriptions: Map<string, any> = new Map();

  constructor(
    private natsService: NatsService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Authenticate socket connection
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.userId;

      // Store socket for this user
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Join user-specific room
      client.join(`user:${userId}`);

      // Subscribe to NATS notifications for this user
      await this.subscribeToUserNotifications(userId);

      console.log(`User ${userId} connected to notifications (socket: ${client.id})`);
    } catch (error) {
      console.error('Socket authentication failed:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    // Remove socket from user's socket set
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);

        // If no more sockets for this user, unsubscribe from NATS
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
          await this.unsubscribeFromUserNotifications(userId);
        }

        console.log(`Socket ${client.id} disconnected from user ${userId}`);
        break;
      }
    }
  }

  /**
   * Subscribe to user's NATS notification stream
   */
  private async subscribeToUserNotifications(userId: string) {
    // Only subscribe if not already subscribed
    if (this.natsSubscriptions.has(userId)) {
      return;
    }

    const subject = `pixelboxx.users.${userId}.notifications`;

    const subscription = await this.natsService.subscribe(subject, (notification: any) => {
      // Emit to all of user's connected sockets
      this.server.to(`user:${userId}`).emit('notification', notification);
    });

    this.natsSubscriptions.set(userId, subscription);
  }

  /**
   * Unsubscribe from user's NATS notification stream
   */
  private async unsubscribeFromUserNotifications(userId: string) {
    const subscription = this.natsSubscriptions.get(userId);
    if (subscription) {
      subscription.unsubscribe();
      this.natsSubscriptions.delete(userId);
    }
  }

  /**
   * Handle client requesting notification count
   */
  @SubscribeMessage('getUnreadCount')
  handleGetUnreadCount(@ConnectedSocket() client: Socket) {
    // This would be handled by the REST API, but we can support it here too
    client.emit('unreadCount', { count: 0 });
  }
}
