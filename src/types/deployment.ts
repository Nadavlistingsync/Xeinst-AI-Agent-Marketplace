import type { Deployment as PrismaDeployment, DeploymentStatus as PrismaDeploymentStatus, AgentFeedback } from '@prisma/client';

export type Deployment = PrismaDeployment;
export type DeploymentStatus = PrismaDeploymentStatus;

export interface DeploymentWithMetrics extends Deployment {
  metrics?: {
    totalRequests: number;
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
  };
  feedbacks?: Array<{
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
  }>;
}

export interface DeploymentMetrics {
  id: string;
  deploymentId: string;
  timestamp: Date;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  metadata: Record<string, unknown>;
}

export interface DeploymentCreateInput {
  name: string;
  description: string;
  status: DeploymentStatus;
  accessLevel: string;
  licenseType: string;
  environment: string;
  framework: string;
  modelType: string;
  isPublic: boolean;
  version: string;
  tags: string[];
  earningsSplit: number;
  fileUrl: string;
  createdBy: string;
}

export interface DeploymentUpdateInput {
  name?: string;
  description?: string;
  status?: DeploymentStatus;
  accessLevel?: string;
  licenseType?: string;
  environment?: string;
  framework?: string;
  modelType?: string;
  isPublic?: boolean;
  version?: string;
  tags?: string[];
  earningsSplit?: number;
  fileUrl?: string;
}

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