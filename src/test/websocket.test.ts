import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { emitDeploymentStatus } from '@/lib/websocket';
import { DeploymentStatus } from '@prisma/client';
import { io as Client } from 'socket.io-client';

describe('WebSocket', () => {
  let io: Server;
  let httpServer: any;
  let client: ReturnType<typeof Client>;

  beforeEach(() => {
    return new Promise<void>((resolve) => {
      httpServer = createServer();
      io = new Server(httpServer);
      httpServer.listen(() => {
        resolve();
      });
    });
  });

  afterEach(() => {
    io.close();
    httpServer.close();
    if (client) {
      client.close();
    }
  });

  it('should emit deployment status', () => {
    return new Promise<void>((resolve) => {
      const mockDeploymentStatus = {
        id: 'test-deployment',
        status: DeploymentStatus.active
      };

      io.on('connection', (socket) => {
        socket.on('deployment_status', (data) => {
          expect(data).toEqual(mockDeploymentStatus);
          resolve();
        });
      });

      emitDeploymentStatus(io, mockDeploymentStatus.id, mockDeploymentStatus.status);
    });
  });

  it('should handle connection', () => {
    return new Promise<void>((resolve) => {
      io.on('connection', (socket) => {
        expect(socket).toBeDefined();
        resolve();
      });

      client = Client(`http://localhost:${(httpServer.address() as any).port}`);
    });
  });

  it('should handle disconnection', () => {
    return new Promise<void>((resolve) => {
      io.on('connection', (socket) => {
        socket.on('disconnect', () => {
          resolve();
        });
      });

      client = Client(`http://localhost:${(httpServer.address() as any).port}`);
      client.close();
    });
  });
}); 