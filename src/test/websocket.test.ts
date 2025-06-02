import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { initSocket, emitDeploymentStatus } from '@/lib/websocket';
import { createServer } from 'http';

describe('WebSocket Server', () => {
  let httpServer: any;
  let ioServer: Server;
  let clientSocket: any;

  beforeEach((done) => {
    httpServer = createServer();
    ioServer = new Server(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      clientSocket = Client(`http://localhost:${port}`);
      clientSocket.on('connect', done);
    });
  });

  afterEach(() => {
    ioServer.close();
    clientSocket.close();
  });

  it('should emit deployment status updates', (done) => {
    const mockDeploymentStatus = {
      id: 'test-deployment',
      status: 'active',
      health: {
        status: 'healthy',
        issues: [],
        metrics: {
          errorRate: 0.01,
          responseTime: 100,
          successRate: 0.99,
          totalRequests: 1000,
          activeUsers: 50,
        },
      },
      lastUpdated: new Date().toISOString(),
    };

    clientSocket.on('deployment_status', (status: any) => {
      expect(status).toEqual(mockDeploymentStatus);
      done();
    });

    emitDeploymentStatus(ioServer, 'test-deployment', mockDeploymentStatus);
  });

  it('should handle deployment room joins and leaves', (done) => {
    const deploymentId = 'test-deployment';
    
    clientSocket.emit('join_deployment', deploymentId);
    
    // Wait for the join event to be processed
    setTimeout(() => {
      expect(ioServer.sockets.adapter.rooms.has(`deployment:${deploymentId}`)).toBe(true);
      
      clientSocket.emit('leave_deployment', deploymentId);
      
      // Wait for the leave event to be processed
      setTimeout(() => {
        expect(ioServer.sockets.adapter.rooms.has(`deployment:${deploymentId}`)).toBe(false);
        done();
      }, 100);
    }, 100);
  });

  it('should handle connection and disconnection events', (done) => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    clientSocket.disconnect();
    
    setTimeout(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('disconnected'));
      consoleSpy.mockRestore();
      done();
    }, 100);
  });
}); 