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
import { PresenceService, UserStatus } from './presence.service';
import { NatsService } from '../nats/nats.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  heartbeatInterval?: NodeJS.Timeout;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/ws',
})
export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private presenceService: PresenceService,
    private natsService: NatsService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;

      if (!client.userId) {
        client.disconnect();
        return;
      }

      // Set user as online
      await this.presenceService.setOnline(client.userId);

      // Publish presence change to NATS
      await this.natsService.publish(NatsService.subjects.userStatus(client.userId), {
        status: UserStatus.ONLINE,
        userId: client.userId,
        timestamp: new Date().toISOString(),
      });

      // Setup heartbeat (every 30 seconds)
      client.heartbeatInterval = setInterval(async () => {
        if (client.userId) {
          await this.presenceService.heartbeat(client.userId);
        }
      }, 30000);

      console.log(`Presence connected: ${client.id} (User: ${client.userId})`);
    } catch (error) {
      console.error('Presence authentication failed:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.heartbeatInterval) {
      clearInterval(client.heartbeatInterval);
    }

    if (client.userId) {
      // Set user as offline
      await this.presenceService.setOffline(client.userId);

      // Publish presence change to NATS
      await this.natsService.publish(NatsService.subjects.userStatus(client.userId), {
        status: UserStatus.OFFLINE,
        userId: client.userId,
        timestamp: new Date().toISOString(),
      });

      console.log(`Presence disconnected: ${client.id} (User: ${client.userId})`);
    }
  }

  @SubscribeMessage('set-status')
  async handleSetStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { status: UserStatus; customStatus?: string },
  ) {
    if (!client.userId) return;

    if (data.status === UserStatus.ONLINE) {
      await this.presenceService.setOnline(client.userId, data.customStatus);
    } else if (data.status === UserStatus.IDLE) {
      await this.presenceService.setIdle(client.userId);
    }

    // Publish to NATS
    await this.natsService.publish(NatsService.subjects.userStatus(client.userId), {
      status: data.status,
      customStatus: data.customStatus,
      userId: client.userId,
      timestamp: new Date().toISOString(),
    });

    client.emit('status-updated', { status: data.status });
  }

  @SubscribeMessage('get-status')
  async handleGetStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userId: string },
  ) {
    const status = await this.presenceService.getStatus(data.userId);
    client.emit('status', { userId: data.userId, ...status });
  }
}
