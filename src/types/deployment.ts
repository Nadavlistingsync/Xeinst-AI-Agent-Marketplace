export type DeploymentStatus = 'pending' | 'deploying' | 'active' | 'failed' | 'stopped';

export interface Deployment {
  id: string;
  name: string;
  description: string;
  status: DeploymentStatus;
  accessLevel: string;
  licenseType: string;
  environment: string;
  framework: string;
  version: string;
  requirements?: string;
  config?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  deployedBy: string;
  rating: number;
  totalRatings: number;
  downloadCount: number;
  startDate: Date;
}

export interface DeploymentMetrics {
  id: string;
  deploymentId: string;
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  successRate: number;
  activeUsers: number;
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeploymentWithMetrics extends Deployment {
  metrics?: DeploymentMetrics[];
  feedbacks?: {
    id: string;
    rating: number;
    comment: string | null;
    sentimentScore: number | null;
    categories: Record<string, number> | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
    user: {
      name: string | null;
      image: string | null;
    };
  }[];
} 