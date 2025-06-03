export interface Agent {
  id: string;
  name: string;
  description: string;
  status: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  image?: string;
  rating?: number;
  reviews?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export type AgentHealth = {
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

export type AgentMetrics = {
  timestamp: Date;
  errorRate: number;
  responseTime: number;
  successRate: number;
  totalRequests: number;
  activeUsers: number;
};

export type AgentLog = {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
};

export type AgentDeployment = {
  id: string;
  status: 'pending' | 'deploying' | 'active' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  health?: AgentHealth;
  metrics?: AgentMetrics[];
  logs?: AgentLog[];
};

export type AgentDeploymentStatus = {
  status: AgentDeployment['status'];
  lastUpdated: Date;
  health?: AgentHealth;
  metrics?: AgentMetrics;
  issues?: string[];
};

export type AgentDeploymentMetrics = {
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  successRate: number;
  activeUsers: number;
  lastUpdated: Date;
};

export type AgentDeploymentFeedback = {
  id: string;
  userId: string;
  rating: number;
  comment?: string;
  sentimentScore?: number;
  categories?: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}; 