import { Server } from 'socket.io';
import { DeploymentStatus } from '@prisma/client';
import type { WebSocketMessage, DeploymentStatusUpdate } from '../types/websocket';

let io: Server;

export const initializeWebSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || '*',
      methods: ['GET', 'POST']
    },
    transports: ['websocket'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      socket.emit('error', {
        type: 'error',
        payload: 'An error occurred in the WebSocket connection'
      });
    });
  });

  return io;
};

export const emitDeploymentStatus = (
  socket: Server,
  deploymentId: string,
  status: DeploymentStatus
) => {
  const update: DeploymentStatusUpdate = {
    id: deploymentId,
    status,
    lastUpdated: new Date().toISOString()
  };

  const message: WebSocketMessage = {
    type: 'deployment_status',
    payload: update
  };

  socket.emit('deployment_status', message);
};

export const broadcastDeploymentStatus = (update: DeploymentStatusUpdate) => {
  if (!io) {
    console.error('WebSocket server not initialized');
    return;
  }

  const message: WebSocketMessage = {
    type: 'deployment_status',
    payload: update
  };

  io.emit('deployment_status', message);
};

export const sendError = (clientId: string, error: string) => {
  if (!io) {
    console.error('WebSocket server not initialized');
    return;
  }

  const message: WebSocketMessage = {
    type: 'error',
    payload: error
  };

  io.to(clientId).emit('error', message);
};

export const sendInfo = (clientId: string, info: string) => {
  if (!io) {
    console.error('WebSocket server not initialized');
    return;
  }

  const message: WebSocketMessage = {
    type: 'info',
    payload: info
  };

  io.to(clientId).emit('info', message);
}; 