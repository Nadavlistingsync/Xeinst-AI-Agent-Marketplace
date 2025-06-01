import { z } from 'zod';

export const healthCheckSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  timestamp: z.date(),
  services: z.record(z.object({
    status: z.enum(['healthy', 'degraded', 'unhealthy']),
    latency: z.number().min(0),
    error: z.string().optional(),
  })),
  version: z.string(),
  uptime: z.number().min(0),
});

export interface HealthCheckResponse {
  success: boolean;
  data?: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: Date;
    services: Record<string, {
      status: 'healthy' | 'degraded' | 'unhealthy';
      latency: number;
      error?: string;
    }>;
    version: string;
    uptime: number;
  };
  error?: string;
}

export interface HealthCheckError {
  success: false;
  error: string;
}

export interface HealthCheckSuccess {
  success: true;
  data: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: Date;
    services: Record<string, {
      status: 'healthy' | 'degraded' | 'unhealthy';
      latency: number;
      error?: string;
    }>;
    version: string;
    uptime: number;
  };
}

export type HealthCheckApiResponse = HealthCheckSuccess | HealthCheckError;

export type HealthCheckInput = z.infer<typeof healthCheckSchema>; 