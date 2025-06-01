import { z } from 'zod';
import { type Agent } from './database';

export const agentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  status: z.enum(['active', 'inactive', 'pending', 'error']),
  metadata: z.record(z.unknown()).optional(),
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