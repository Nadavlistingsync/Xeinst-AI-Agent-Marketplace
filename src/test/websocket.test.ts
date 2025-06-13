import { Server } from 'socket.io';
import { io as createIO } from 'socket.io-client';
import { createServer } from 'http';
import type { DeploymentStatus } from '@prisma/client';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('WebSocket Server', () => {
  let httpServer: any;
  let io: Server;
  let clientSocket: ReturnType<typeof createIO>;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);
    
    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      clientSocket = createIO(`http://localhost:${port}`);
      clientSocket.on('connect', () => {
        done();
      });
    });
  });

  afterAll(() => {
    if (io) io.close();
    if (clientSocket) clientSocket.close();
    if (httpServer) httpServer.close();
  });

  it('should emit deployment status', (done) => {
    const mockDeployment = {
      id: 'test-deployment',
      status: 'running',
      timestamp: new Date().toISOString(),
    };

    clientSocket.on('connect', () => {
      clientSocket.on('deployment-status', (data) => {
        expect(data).toEqual(mockDeployment);
        done();
      });
      io.emit('deployment-status', mockDeployment);
    });
  });

  it('should handle connection', (done) => {
    const newClient = createIO(`http://localhost:${(httpServer.address() as any).port}`);
    
    newClient.on('connect', () => {
      expect(newClient.connected).toBe(true);
      newClient.close();
      done();
    });
  });

  it('should handle disconnection', (done) => {
    const newClient = createIO(`http://localhost:${(httpServer.address() as any).port}`);
    
    newClient.on('connect', () => {
      newClient.close();
    });

    newClient.on('disconnect', () => {
      expect(newClient.connected).toBe(false);
      done();
    });
  });
}); 