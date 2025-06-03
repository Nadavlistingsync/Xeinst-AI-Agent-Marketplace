import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { emitDeploymentStatus } from '@/lib/websocket';
import { DeploymentStatus } from '@prisma/client';
import type { DeploymentStatusUpdate } from '@/types/websocket';

describe('WebSocket', () => {
  let io: Server;
  let httpServer: any;

  beforeEach((done) => {
    httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      done();
    });
  });

  afterEach(() => {
    io.close();
    httpServer.close();
  });

  it('should emit deployment status', (done) => {
    const mockDeploymentStatus = {
      id: 'test-deployment',
      status: DeploymentStatus.active
    };

    io.on('connection', (socket) => {
      socket.on('deployment_status', (data) => {
        expect(data).toEqual(mockDeploymentStatus);
        done();
      });
    });

    emitDeploymentStatus(io, mockDeploymentStatus.id, mockDeploymentStatus.status);
  });

  it('should handle connection', (done) => {
    io.on('connection', (socket) => {
      expect(socket).toBeDefined();
      done();
    });

    const client = io.listen(httpServer);
    client.connect();
  });

  it('should handle disconnection', (done) => {
    io.on('connection', (socket) => {
      socket.on('disconnect', () => {
        done();
      });
    });

    const client = io.listen(httpServer);
    client.connect();
    client.disconnect();
  });
}); 