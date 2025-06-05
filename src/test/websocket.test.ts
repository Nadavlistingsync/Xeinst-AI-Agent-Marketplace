import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { emitDeploymentStatus, initializeWebSocket } from '@/lib/websocket';
import { DeploymentStatus } from '@prisma/client';
import { io as Client } from 'socket.io-client';
import type { DeploymentStatusUpdate } from '@/types/websocket';

describe('WebSocket', () => {
  let io: Server;
  let httpServer: any;
  let client: ReturnType<typeof Client>;

  beforeEach(() => {
    return new Promise<void>((resolve) => {
      httpServer = createServer();
      io = initializeWebSocket(httpServer);
      httpServer.listen(() => {
        resolve();
      });
    });
  });

  afterEach(() => {
    return new Promise<void>((resolve) => {
      if (client) {
        client.close();
      }
      io.close(() => {
        httpServer.close(() => {
          resolve();
        });
      });
    });
  });

  it('should emit deployment status', async () => {
    const mockDeploymentStatus: DeploymentStatusUpdate = {
      id: 'test-deployment',
      status: DeploymentStatus.active,
      lastUpdated: new Date().toISOString()
    };

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Test timed out'));
      }, 5000);

      client = Client(`http://localhost:${(httpServer.address() as any).port}`, {
        transports: ['websocket'],
        autoConnect: false
      });

      client.on('connect', () => {
        client.on('deployment_status', (data) => {
          try {
            expect(data.type).toBe('deployment_status');
            expect(data.payload.id).toBe(mockDeploymentStatus.id);
            expect(data.payload.status).toBe(mockDeploymentStatus.status);
            expect(typeof data.payload.lastUpdated).toBe('string');
            clearTimeout(timeout);
            resolve();
          } catch (error) {
            reject(error);
          }
        });

        emitDeploymentStatus(io, mockDeploymentStatus.id, mockDeploymentStatus.status);
      });

      client.connect();
    });
  });

  it('should handle connection', async () => {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Test timed out'));
      }, 5000);

      io.on('connection', (socket) => {
        expect(socket).toBeDefined();
        expect(socket.id).toBeDefined();
        clearTimeout(timeout);
        resolve();
      });

      client = Client(`http://localhost:${(httpServer.address() as any).port}`, {
        transports: ['websocket'],
        autoConnect: true
      });
    });
  });

  it('should handle disconnection', async () => {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Test timed out'));
      }, 5000);

      io.on('connection', (socket) => {
        socket.on('disconnect', () => {
          clearTimeout(timeout);
          resolve();
        });
      });

      client = Client(`http://localhost:${(httpServer.address() as any).port}`, {
        transports: ['websocket'],
        autoConnect: true
      });

      client.on('connect', () => {
        client.close();
      });
    });
  });
}); 