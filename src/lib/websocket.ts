import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export const initSocket = (res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      console.log('Client connected');

      socket.on('join', async (userId: string) => {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined their room`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });

    res.socket.server.io = io;
  }

  return res.socket.server.io;
};

export const emitNotification = (io: SocketIOServer, userId: string, notification: any) => {
  io.to(`user:${userId}`).emit('notification', notification);
};

export const emitFeedbackUpdate = (io: SocketIOServer, agentId: string, feedback: any) => {
  io.to(`agent:${agentId}`).emit('feedback_update', feedback);
}; 