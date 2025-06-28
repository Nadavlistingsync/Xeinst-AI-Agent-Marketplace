import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { io as Client } from 'socket.io-client';
import { createServer } from 'http';
import { Server } from 'socket.io';

describe('WebSocket', () => {
  let io;
  let clientSocket;
  let httpServer;
  let httpServerAddr;

  beforeEach(async () => {
    httpServer = createServer();
    io = new Server(httpServer);
    
    return new Promise<void>((resolve) => {
      httpServer.listen(() => {
        httpServerAddr = httpServer.address();
        const port = httpServerAddr.port;
        clientSocket = Client(`http://localhost:${port}`);
        
        io.on('connection', (socket) => {
          socket.on('join-deployment', (deploymentId) => {
            socket.join(deploymentId);
            socket.emit('deployment-status', { status: 'active', deploymentId });
          });
        });
        
        clientSocket.on('connect', () => {
          resolve();
        });
      });
    });
  });

  afterEach(async () => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
    if (io) {
      io.close();
    }
    if (httpServer) {
      return new Promise<void>((resolve) => {
        httpServer.close(() => resolve());
      });
    }
  });

  it('should emit deployment status', async () => {
    return new Promise<void>((resolve) => {
      clientSocket.emit('join-deployment', 'test-deployment');
      clientSocket.on('deployment-status', (data) => {
        expect(data.status).toBe('active');
        expect(data.deploymentId).toBe('test-deployment');
        resolve();
      });
    });
  });

  it('should handle connection', async () => {
    expect(clientSocket.connected).toBe(true);
  });

  it('should handle disconnection', async () => {
    return new Promise<void>((resolve) => {
      clientSocket.on('disconnect', () => {
        expect(clientSocket.connected).toBe(false);
        resolve();
      });
      clientSocket.disconnect();
    });
  });
}); 