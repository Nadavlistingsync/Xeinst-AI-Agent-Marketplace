import { db } from '@/lib/db';
import { agentFeedbacks, agentMetrics, agentLog } from '@/lib/schema';
import { eq, gte, lte, desc, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface AgentMetrics {
  id?: string;
  agentId: string;
  requests: number;
  errors: number;
  avgResponseTime: string;
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
  timestamp: Date;
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
      avgResponseTime: metrics.avgResponseTime || '0',
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
    timestamp: new Date(),
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
    query = query.where(gte(agentLog.timestamp, options.startDate));
  }

  if (options.endDate) {
    query = query.where(lte(agentLog.timestamp, options.endDate));
  }

  if (options.level) {
    query = query.where(eq(agentLog.level, options.level));
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  query = query.orderBy(desc(agentLog.timestamp));

  const logs = await query;
  return logs.map(log => ({
    ...log,
    level: log.level as 'info' | 'warning' | 'error'
  }));
}

export async function getAgentDeploymentHistory(agentId: string): Promise<any[]> {
  const deploymentHistory = await db
    .select()
    .from(agentLog)
    .where(and(
      eq(agentLog.agentId, agentId),
      eq(agentLog.level, 'info'),
      eq(agentLog.message, 'Deployment completed')
    ))
    .orderBy(desc(agentLog.timestamp));

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
  const avgResponseTime = parseFloat(metrics.avgResponseTime);
  if (avgResponseTime > 1000) {
    issues.push(`Slow response time: ${avgResponseTime.toFixed(0)}ms`);
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
  return db
    .select()
    .from(agentFeedbacks)
    .where(and(
      eq(agentFeedbacks.agentId, agentId),
      gte(agentFeedbacks.created_at, timeRange.start),
      lte(agentFeedbacks.created_at, timeRange.end)
    ))
    .orderBy(desc(agentFeedbacks.created_at));
}

export async function getAgentDeployments(agentId: string): Promise<any[]> {
  return db
    .select()
    .from(agentLog)
    .where(and(
      eq(agentLog.agentId, agentId),
      eq(agentLog.level, 'info'),
      eq(agentLog.message, 'Deployment completed')
    ))
    .orderBy(desc(agentLog.timestamp));
} 