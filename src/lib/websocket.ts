import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';
import { getAgentHealth } from './agent-monitoring';

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export type DeploymentStatus = {
  id: string;
  status: 'pending' | 'deploying' | 'active' | 'failed' | 'stopped';
  health: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    issues: string[];
    metrics: {
      errorRate: number;
      responseTime: number;
      successRate: number;
      totalRequests: number;
      activeUsers: number;
    };
  };
  lastUpdated: string;
};

export function initSocket(res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL,
        methods: ['GET', 'POST'],
      },
    });
    res.socket.server.io = io;

    io.on('connection', socket => {
      console.log('Client connected:', socket.id);

      // Handle deployment room joins
      socket.on('join_deployment', (deploymentId: string) => {
        socket.join(`deployment:${deploymentId}`);
        console.log(`Client ${socket.id} joined deployment room: ${deploymentId}`);
      });

      // Handle deployment room leaves
      socket.on('leave_deployment', (deploymentId: string) => {
        socket.leave(`deployment:${deploymentId}`);
        console.log(`Client ${socket.id} left deployment room: ${deploymentId}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    // Start periodic health checks for active deployments
    setInterval(async () => {
      try {
        const activeDeployments = await prisma?.deployment.findMany({
          where: {
            status: 'active',
          },
          select: {
            id: true,
          },
        });

        for (const deployment of activeDeployments) {
          const health = await getAgentHealth(deployment.id);
          const status: DeploymentStatus = {
            id: deployment.id,
            status: 'active',
            health,
            lastUpdated: new Date().toISOString(),
          };

          io.to(`deployment:${deployment.id}`).emit('deployment_status', status);
        }
      } catch (error) {
        console.error('Error in deployment health check:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  return res.socket.server.io;
}

export const emitDeploymentStatus = (io: SocketIOServer, deploymentId: string, status: DeploymentStatus) => {
  io.to(`deployment:${deploymentId}`).emit('deployment_status', status);
};

export const emitDeploymentMetrics = (io: SocketIOServer, deploymentId: string, metrics: any) => {
  io.to(`deployment:${deploymentId}`).emit('deployment_metrics', metrics);
};

export const emitDeploymentLog = (io: SocketIOServer, deploymentId: string, log: any) => {
  io.to(`deployment:${deploymentId}`).emit('deployment_log', log);
};

export const emitNotification = (io: SocketIOServer, userId: string, notification: any) => {
  io.to(`user:${userId}`).emit('notification', notification);
};

export const emitFeedbackUpdate = (io: SocketIOServer, agentId: string, feedback: any) => {
  io.to(`agent:${agentId}`).emit('feedback_update', feedback);
}; 