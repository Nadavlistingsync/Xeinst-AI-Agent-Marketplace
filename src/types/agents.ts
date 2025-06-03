import { z } from 'zod';

export type DeploymentStatus = 'pending' | 'deploying' | 'active' | 'failed' | 'stopped';

export interface Agent {
  id: string;
  name: string;
  description: string;
  version: string;
  framework: string;
  modelType: string;
  status: DeploymentStatus;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export interface AgentMetrics {
  id: string;
  deploymentId: string;
  responseTime: number;
  requestsPerMinute: number;
  averageTokensUsed: number;
  costPerRequest: number;
  totalCost: number;
  errorRate: number;
  successRate: number;
  totalRequests: number;
  activeUsers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  issues: string[];
  metrics: {
    errorRate: number;
    responseTime: number;
    successRate: number;
    totalRequests: number;
    activeUsers: number;
  };
  lastUpdated: Date;
}

export const agentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  version: z.string().min(1),
  framework: z.string().min(1),
  modelType: z.string().min(1),
  isPublic: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
});

export const agentMetricsSchema = z.object({
  responseTime: z.number().min(0),
  requestsPerMinute: z.number().min(0),
  averageTokensUsed: z.number().min(0),
  costPerRequest: z.number().min(0),
  totalCost: z.number().min(0),
  errorRate: z.number().min(0).max(1),
  successRate: z.number().min(0).max(1),
  totalRequests: z.number().min(0),
  activeUsers: z.number().min(0),
});

export const agentHealthSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  issues: z.array(z.string()),
  metrics: z.object({
    errorRate: z.number().min(0).max(1),
    responseTime: z.number().min(0),
    successRate: z.number().min(0).max(1),
    totalRequests: z.number().min(0),
    activeUsers: z.number().min(0),
  }),
  lastUpdated: z.date(),
});

export const agentUpdateSchema = agentSchema.partial();

export const agentQuerySchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  status: z.enum(['active', 'inactive', 'pending', 'error']).optional(),
  search: z.string().optional(),
});

export interface AgentResponse {
  success: boolean;
  agent?: Agent;
  error?: string;
}

export interface AgentsResponse {
  success: boolean;
  agents: Agent[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
  error?: string;
}

export interface AgentError {
  success: false;
  error: string;
}

export interface AgentSuccess {
  success: true;
  agent: Agent;
}

export interface AgentsSuccess {
  success: true;
  agents: Agent[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export type AgentApiResponse = AgentSuccess | AgentError;
export type AgentsApiResponse = AgentsSuccess | AgentError;

export type AgentInput = z.infer<typeof agentSchema>;
export type AgentUpdateInput = z.infer<typeof agentUpdateSchema>;
export type AgentQueryInput = z.infer<typeof agentQuerySchema>; 