import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: Server | null = null;

export function initializeSocket(userId: string) {
  if (!io) {
    throw new Error('Socket server not initialized');
  }

  const socket = io.sockets.sockets.get(userId);
  if (socket) {
    return socket;
  }

  return io.sockets.sockets.get(userId) || null;
}

export function setupSocketServer(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Add more socket event handlers here
  });

  return io;
}

export default function setupSocket() {
  // Implement socket logic here
  return null;
} 