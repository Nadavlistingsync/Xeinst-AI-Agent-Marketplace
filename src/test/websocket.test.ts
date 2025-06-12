import { Server } from 'socket.io';
import { createServer } from 'http';
import type { DeploymentStatus } from '@prisma/client';
import { io as Client } from 'socket.io-client';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('WebSocket Server', () => {
  let httpServer: any;
  let io: Server;
  let clientSocket: any;

  beforeEach(() => {
    return new Promise<void>((resolve) => {
      httpServer = createServer();
      io = new Server(httpServer);
      httpServer.listen(() => {
        const port = (httpServer.address() as any).port;
        clientSocket = Client(`http://localhost:${port}`);
        clientSocket.on('connect', () => resolve());
      });
    });
  });

  afterEach(() => {
    io.close();
    clientSocket.close();
  });

  it('should emit deployment status', () => {
    return new Promise<void>((resolve) => {
      const mockDeploymentStatus = {
        id: '1',
        status: 'active' as DeploymentStatus,
        message: 'Deployment is active',
      };

      clientSocket.on('deployment_status', (data: any) => {
        expect(data).toEqual(mockDeploymentStatus);
        resolve();
      });

      io.emit('deployment_status', mockDeploymentStatus);
    });
  });

  it('should handle connection', () => {
    return new Promise<void>((resolve) => {
      io.on('connection', (socket) => {
        expect(socket).toBeDefined();
        resolve();
      });
    });
  });

  it('should handle disconnection', () => {
    return new Promise<void>((resolve) => {
      io.on('connection', (socket) => {
        socket.on('disconnect', () => {
          resolve();
        });
        socket.disconnect();
      });
    });
  });
}); 