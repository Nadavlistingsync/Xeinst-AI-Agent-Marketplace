import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { emitDeploymentStatus } from '@/lib/websocket';
import { DeploymentStatus } from '@prisma/client';
import type { DeploymentStatusUpdate } from '@/types/websocket';

describe('WebSocket Server', () => {
  let io: Server;
  let httpServer: ReturnType<typeof createServer>;

  beforeEach(() => {
    httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen();
  });

  afterEach(() => {
    io.close();
    httpServer.close();
  });

  it('should emit deployment status updates', (done) => {
    const mockDeploymentStatus: DeploymentStatusUpdate = {
      id: 'test-deployment',
      status: DeploymentStatus.ACTIVE,
      metrics: {
        errorRate: 0,
        successRate: 100,
        activeUsers: 10,
        totalRequests: 1000,
        averageResponseTime: 200,
        requestsPerMinute: 50,
        averageTokensUsed: 100,
        costPerRequest: 0.001,
        totalCost: 1.0
      },
      lastUpdated: new Date().toISOString()
    };

    io.on('connection', (socket) => {
      socket.on('deployment_status', (data) => {
        expect(data).toEqual(mockDeploymentStatus);
        done();
      });
    });

    emitDeploymentStatus(mockDeploymentStatus);
  });

  it('should handle connection events', (done) => {
    io.on('connection', (socket) => {
      expect(socket).toBeDefined();
      done();
    });

    const client = io.connect();
  });

  it('should handle disconnection events', (done) => {
    io.on('connection', (socket) => {
      socket.on('disconnect', () => {
        done();
      });
    });

    const client = io.connect();
    client.disconnect();
  });
}); 