import type { Deployment as PrismaDeployment, DeploymentStatus as PrismaDeploymentStatus } from '@prisma/client';

export type Deployment = PrismaDeployment;
export type DeploymentStatus = PrismaDeploymentStatus;

export interface DeploymentWithMetrics extends Deployment {
  metrics: {
    totalRequests: number;
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
    timestamp: Date;
  }[];
  config?: Record<string, unknown>;
}

export interface DeploymentCreateInput {
  name: string;
  description: string;
  environment: string;
  framework: string;
  modelType: string;
  config?: Record<string, unknown>;
  createdBy: string;
}

export interface DeploymentUpdateInput {
  name?: string;
  description?: string;
  environment?: string;
  framework?: string;
  modelType?: string;
  config?: Record<string, unknown>;
  status?: DeploymentStatus;
  health?: Record<string, unknown>;
}

export interface DeploymentMetrics {
  totalRequests: number;
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  timestamp: Date;
}

export interface DeploymentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastChecked: Date;
  issues: {
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  metrics: {
    cpu: number;
    memory: number;
    latency: number;
  };
}

export interface DeploymentLog {
  id: string;
  deploymentId: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface DeploymentVersion {
  id: string;
  deploymentId: string;
  version: string;
  changes: string;
  createdAt: Date;
  createdBy: string;
  config: Record<string, unknown>;
}

export interface DeploymentFeedback {
  id: string;
  deploymentId: string;
  rating: number;
  comment: string | null;
  sentimentScore: number | null;
  categories: Record<string, number> | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  creatorResponse: string | null;
  responseDate: Date | null;
  metadata: Record<string, unknown> | null;
}

export interface DeploymentReview {
  id: string;
  deploymentId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeploymentAnalytics {
  totalRequests: number;
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  feedbackStats: {
    averageRating: number;
    totalFeedback: number;
    sentimentDistribution: Record<string, number>;
    categoryDistribution: Record<string, number>;
  };
  timeRange: {
    start: Date;
    end: Date;
  };
} 