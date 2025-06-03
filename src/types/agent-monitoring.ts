import { DeploymentStatus, NotificationType } from '@prisma/client';
import { JsonValue } from './json';

export interface AgentFeedback {
  id: string;
  userId: string;
  deploymentId: string;
  rating: number;
  comment: string | null;
  sentimentScore: number;
  categories: Record<string, number> | null;
  creatorResponse: string | null;
  responseDate: Date | null;
  metadata: JsonValue;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentMetrics {
  id: string;
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
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
  lastUpdated: Date;
}

export interface AgentLog {
  id: string;
  deploymentId: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata: JsonValue;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentHealth {
  status: DeploymentStatus;
  lastChecked: Date;
  metrics: {
    errorRate: number;
    responseTime: number;
    successRate: number;
    totalRequests: number;
    activeUsers: number;
  };
  logs: AgentLog[];
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  message: string;
  metadata?: JsonValue;
}

export interface FeedbackMetrics {
  averageRating: number;
  totalFeedbacks: number;
  sentimentScore: number;
  categories: Record<string, number>;
  responseRate: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  trends: {
    rating: number;
    sentiment: number;
    volume: number;
  };
} 