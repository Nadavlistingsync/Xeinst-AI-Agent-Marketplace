import { db } from '@/lib/db';
import { agentFeedbacks, agentMetrics, agentLog } from '@/lib/schema';
import { eq, gte, lte, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface AgentMetrics {
  id?: string;
  agentId: string;
  requests: number;
  errors: number;
  avgResponseTime: number;
  lastActive: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface AgentLog {
  id?: string;
  agentId: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata?: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
}

export interface GetAgentLogsOptions {
  startDate?: Date;
  endDate?: Date;
  level?: 'info' | 'warning' | 'error';
  limit?: number;
}

export async function updateAgentMetrics(
  agentId: string,
  metrics: Partial<AgentMetrics>
): Promise<void> {
  const existingMetrics = await db
    .select()
    .from(agentMetrics)
    .where(eq(agentMetrics.agentId, agentId))
    .limit(1);

  if (existingMetrics.length > 0) {
    await db
      .update(agentMetrics)
      .set({
        ...metrics,
        updated_at: new Date()
      })
      .where(eq(agentMetrics.agentId, agentId));
  } else {
    await db.insert(agentMetrics).values({
      agentId,
      requests: metrics.requests || 0,
      errors: metrics.errors || 0,
      avgResponseTime: metrics.avgResponseTime || 0,
      lastActive: metrics.lastActive || new Date(),
      created_at: new Date(),
      updated_at: new Date()
    });
  }
}

export async function logAgentEvent(
  agentId: string,
  level: 'info' | 'warning' | 'error',
  message: string,
  metadata?: Record<string, any>
): Promise<void> {
  await db.insert(agentLog).values({
    agentId,
    level,
    message,
    metadata,
    created_at: new Date(),
    updated_at: new Date()
  });
}

export async function getAgentMetrics(agentId: string): Promise<AgentMetrics | null> {
  const metrics = await db
    .select()
    .from(agentMetrics)
    .where(eq(agentMetrics.agentId, agentId))
    .limit(1);

  return metrics[0] || null;
}

export async function getAgentLogs(
  agentId: string,
  options: GetAgentLogsOptions = {}
): Promise<AgentLog[]> {
  let query = db
    .select()
    .from(agentLog)
    .where(eq(agentLog.agentId, agentId));

  if (options.startDate) {
    query = query.where(gte(agentLog.created_at, options.startDate));
  }

  if (options.endDate) {
    query = query.where(lte(agentLog.created_at, options.endDate));
  }

  if (options.level) {
    query = query.where(eq(agentLog.level, options.level));
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  query = query.orderBy(desc(agentLog.created_at));

  return query;
}

export async function getAgentDeploymentHistory(agentId: string): Promise<any[]> {
  const deploymentHistory = await db
    .select()
    .from(agentLog)
    .where(eq(agentLog.agentId, agentId))
    .where(eq(agentLog.level, 'info'))
    .where(eq(agentLog.message, 'Deployment completed'))
    .orderBy(desc(agentLog.created_at));

  return deploymentHistory;
}

export async function getAgentPerformanceMetrics(agentId: string): Promise<any> {
  const metrics = await getAgentMetrics(agentId);
  const logs = await getAgentLogs(agentId, {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    limit: 100
  });

  const errorCount = logs.filter(log => log.level === 'error').length;
  const warningCount = logs.filter(log => log.level === 'warning').length;

  return {
    metrics,
    errorCount,
    warningCount,
    recentLogs: logs
  };
}

export async function getAgentHealth(agentId: string): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  issues: string[];
}> {
  const metrics = await getAgentMetrics(agentId);
  if (!metrics) {
    return {
      status: 'unhealthy',
      issues: ['No metrics available'],
    };
  }

  const issues: string[] = [];
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  // Check error rate
  const errorRate = metrics.errors / metrics.requests;
  if (errorRate > 0.1) {
    issues.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`);
    status = 'unhealthy';
  } else if (errorRate > 0.05) {
    issues.push(`Elevated error rate: ${(errorRate * 100).toFixed(1)}%`);
    status = 'degraded';
  }

  // Check response time
  if (metrics.avgResponseTime > 1000) {
    issues.push(`Slow response time: ${metrics.avgResponseTime.toFixed(0)}ms`);
    status = status === 'healthy' ? 'degraded' : status;
  }

  // Check last activity
  const hoursSinceLastActive = (Date.now() - metrics.lastActive.getTime()) / (1000 * 60 * 60);
  if (hoursSinceLastActive > 24) {
    issues.push(`No activity in ${Math.floor(hoursSinceLastActive)} hours`);
    status = status === 'healthy' ? 'degraded' : status;
  }

  return { status, issues };
}

export async function submitAgentFeedback(
  agentId: string,
  userId: string,
  rating: number,
  comment: string | null = null
): Promise<void> {
  await db.insert(agentFeedbacks).values({
    id: uuidv4(),
    agentId,
    userId,
    rating,
    comment,
    created_at: new Date(),
    updated_at: new Date()
  });
}

export async function getAgentFeedback(agentId: string, timeRange: { start: Date; end: Date }): Promise<any[]> {
  const feedback = await db.select()
    .from(agentFeedbacks)
    .where(
      and(
        eq(agentFeedbacks.agentId, agentId),
        gte(agentFeedbacks.created_at, timeRange.start),
        lte(agentFeedbacks.created_at, timeRange.end)
      )
    )
    .orderBy(desc(agentFeedbacks.created_at));

  return feedback;
}

export async function getAgentDeployments(agentId: string): Promise<any[]> {
  const deployments = await db.select()
    .from(deployments)
    .where(eq(deployments.agentId, agentId))
    .orderBy(desc(deployments.created_at));

  return deployments;
} 