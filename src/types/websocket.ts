import { DeploymentStatus } from '@prisma/client';

export interface DeploymentMetrics {
  errorRate: number;
  successRate: number;
  activeUsers: number;
  totalRequests: number;
  averageResponseTime: number;
  requestsPerMinute: number;
  averageTokensUsed: number;
  costPerRequest: number;
  totalCost: number;
}

export interface DeploymentStatusUpdate {
  id: string;
  status: DeploymentStatus;
  metrics?: DeploymentMetrics;
  lastUpdated: string;
}

export interface WebSocketMessage {
  type: 'deployment_status' | 'error' | 'log';
  payload: DeploymentStatusUpdate | string;
} 