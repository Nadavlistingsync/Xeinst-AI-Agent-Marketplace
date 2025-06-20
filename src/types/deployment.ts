import { DeploymentStatus } from '@prisma/client';
import { JsonValue } from './json';

export interface Deployment {
  id: string;
  name: string;
  status: DeploymentStatus;
  description: string;
  accessLevel: string;
  licenseType: string;
  environment: string;
  framework: string;
  modelType: string;
  source: string;
  deployedBy: string;
  createdBy: string;
  rating: number;
  totalRatings: number;
  downloadCount: number;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  version: string;
  health: JsonValue;
  price: number | null;
  config?: Record<string, unknown>;
}

export interface DeploymentWithMetrics extends Deployment {
  metrics: Array<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deploymentId: string;
    errorRate: number;
    responseTime: number;
    successRate: number;
    totalRequests: number;
    activeUsers: number;
    averageResponseTime: number;
    requestsPerMinute: number;
    averageTokensUsed: number;
    costPerRequest: number;
    totalCost: number;
    lastUpdated: Date;
  }>;
  feedbacks: Array<{
    id: string;
    rating: number;
    comment: string | null;
    sentimentScore: number | null;
    createdAt: Date;
    updatedAt: Date;
    deploymentId: string;
    userId: string;
    categories: JsonValue | null;
    creatorResponse: string | null;
    responseDate: Date | null;
    metadata: JsonValue | null;
    user?: {
      name: string | null;
      email: string | null;
      image: string | null;
    };
  }>;
}

export interface CreateDeploymentInput {
  name: string;
  description: string;
  accessLevel: string;
  licenseType: string;
  environment: string;
  framework: string;
  modelType: string;
  isPublic: boolean;
  version: string;
  tags: string[];
  earningsSplit: number;
  createdBy: string;
  deployedBy: string;
}

export interface UpdateDeploymentInput {
  name?: string;
  description?: string;
  accessLevel?: string;
  licenseType?: string;
  environment?: string;
  framework?: string;
  modelType?: string;
  category?: string;
  isPublic?: boolean;
  version?: string;
  tags?: string[];
  earningsSplit?: number;
  status?: DeploymentStatus;
  health?: JsonValue;
}

export type DeploymentStatusType = 'active' | 'failed' | 'pending' | 'stopped';

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

export interface DeploymentStatusUpdate {
  status: DeploymentStatusType;
  lastUpdated: string;
  metrics?: DeploymentMetrics;
} 