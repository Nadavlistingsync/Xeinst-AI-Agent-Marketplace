import { db } from '@/lib/db';
import { agentFeedbacks, deployments } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

interface AgentMetrics {
  requests: number;
  errors: number;
  avgResponseTime: number;
  lastActive: Date;
}

interface AgentLog {
  agentId: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata?: {
    duration?: number;
    status?: string;
    errorCode?: string;
    stackTrace?: string;
    [key: string]: unknown;
  };
  timestamp: Date;
}

export async function trackAgentRequest(
  agentId: string,
  responseTime: number,
  success: boolean
): Promise<void> {
  const now = new Date();
  
  // Fetch current metrics to calculate new avgResponseTime
  const currentMetrics = await db.select({ avgResponseTime: agentMetrics.avgResponseTime })
    .from(agentMetrics)
    .where(eq(agentMetrics.agentId, agentId));
  const newAvgResponseTime = currentMetrics.length > 0
    ? (currentMetrics[0].avgResponseTime + responseTime) / 2
    : responseTime;

  await db.insert(agentMetrics)
    .values({
      id: uuidv4(),
      agentId,
      requests: { increment: 1 },
      errors: { increment: success ? 0 : 1 },
      avgResponseTime: { set: newAvgResponseTime },
      lastActive: now,
    })
    .onConflictDoUpdate({
      target: agentMetrics.agentId,
      set: {
        requests: { increment: 1 },
        errors: { increment: success ? 0 : 1 },
        avgResponseTime: { set: newAvgResponseTime },
        lastActive: now,
      },
    });
}

export async function logAgentEvent(
  agentId: string,
  level: AgentLog['level'],
  message: string,
  metadata?: Record<string, any>
): Promise<void> {
  await db.insert(agentLog)
    .values({
      id: uuidv4(),
      agentId,
      level,
      message,
      metadata,
      timestamp: new Date(),
    })
    .returning();
}

export async function getAgentMetrics(agentId: string): Promise<AgentMetrics | null> {
  const metrics = await db.select({
    requests: agentMetrics.requests,
    errors: agentMetrics.errors,
    avgResponseTime: agentMetrics.avgResponseTime,
    lastActive: agentMetrics.lastActive,
  })
    .from(agentMetrics)
    .where(eq(agentMetrics.agentId, agentId));

  if (metrics.length === 0) return null;

  return {
    requests: metrics[0].requests,
    errors: metrics[0].errors,
    avgResponseTime: metrics[0].avgResponseTime,
    lastActive: metrics[0].lastActive,
  };
}

export async function getAgentLogs(
  agentId: string,
  options: {
    level?: AgentLog['level'];
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<AgentLog[]> {
  const { level, startDate, endDate, limit = 100 } = options;

  const logs = await db.select({
    id: agentLog.id,
    agentId: agentLog.agentId,
    level: agentLog.level,
    message: agentLog.message,
    metadata: agentLog.metadata,
    timestamp: agentLog.timestamp,
  })
    .from(agentLog)
    .where(eq(agentLog.agentId, agentId))
    .and(eq(agentLog.level, level))
    .and(eq(agentLog.timestamp, { gte: startDate, lte: endDate }))
    .orderBy(agentLog.timestamp)
    .limit(limit);

  return logs.map(log => ({
    ...log,
    level: log.level as AgentLog['level'],
  }));
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

export async function submitAgentFeedback({
  agentId,
  userId,
  rating,
  comment,
}: {
  agentId: string;
  userId: string;
  rating: number;
  comment?: string;
}) {
  return db.insert(agentFeedbacks).values({
    id: uuidv4(),
    agentId,
    userId,
    rating,
    comment,
    created_at: new Date(),
    updated_at: new Date(),
  }).returning();
}

export async function getAgentFeedback(agentId: string) {
  return db
    .select({
      id: agentFeedbacks.id,
      agentId: agentFeedbacks.agentId,
      userId: agentFeedbacks.userId,
      rating: agentFeedbacks.rating,
      comment: agentFeedbacks.comment,
      created_at: agentFeedbacks.created_at,
      user: {
        id: deployments.deployed_by,
        name: deployments.name,
      },
    })
    .from(agentFeedbacks)
    .leftJoin(deployments, eq(agentFeedbacks.agentId, deployments.id))
    .where(eq(agentFeedbacks.agentId, agentId))
    .orderBy(agentFeedbacks.created_at);
} 