import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { createServer } from 'http';

describe('WebSocket', () => {
  let httpServer: ReturnType<typeof createServer>;
  let io: Server;
  let clientSocket: ReturnType<typeof Client>;

  beforeAll(() => {
    return new Promise<void>((resolve) => {
      httpServer = createServer();
      io = new Server(httpServer);
      httpServer.listen(() => {
        const port = (httpServer.address() as any).port;
        clientSocket = Client(`http://localhost:${port}`);
        clientSocket.on('connect', () => {
          resolve();
        });
      });
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
    httpServer.close();
  });

  it('should emit deployment status', () => {
    return new Promise<void>((resolve) => {
      clientSocket.on('connect', () => {
        const mockStatus = {
          status: 'deploying',
          progress: 50,
          message: 'Deploying...',
          timestamp: new Date().toISOString(),
        };

        clientSocket.on('deployment-status', (data: typeof mockStatus) => {
          expect(data).toEqual(mockStatus);
          resolve();
        });

        io.emit('deployment-status', mockStatus);
      });
    });
  });

  it('should handle connection', () => {
    return new Promise<void>((resolve) => {
      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        resolve();
      });
    });
  });

  it('should handle disconnection', () => {
    return new Promise<void>((resolve) => {
      clientSocket.on('connect', () => {
        clientSocket.disconnect();
        expect(clientSocket.connected).toBe(false);
        resolve();
      });
    });
  });
}); 