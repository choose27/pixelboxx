'use client';

import { useEffect, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '@/lib/socket';

export function useRealtime(token?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socketInstance = getSocket(token);

    const handleConnect = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    const handleDisconnect = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    const handleError = (error: any) => {
      console.error('WebSocket error:', error);
    };

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    socketInstance.on('error', handleError);

    socketInstance.connect();
    setSocket(socketInstance);

    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.off('error', handleError);
      disconnectSocket();
    };
  }, [token]);

  const subscribeToChannel = useCallback(
    (channelId: string) => {
      if (!socket) return;
      socket.emit('subscribe-channel', { channelId });
    },
    [socket],
  );

  const unsubscribeFromChannel = useCallback(
    (channelId: string) => {
      if (!socket) return;
      socket.emit('unsubscribe-channel', { channelId });
    },
    [socket],
  );

  const sendTyping = useCallback(
    (channelId: string, boxxId: string) => {
      if (!socket) return;
      socket.emit('typing', { channelId, boxxId });
    },
    [socket],
  );

  return {
    socket,
    connected,
    subscribeToChannel,
    unsubscribeFromChannel,
    sendTyping,
  };
}
