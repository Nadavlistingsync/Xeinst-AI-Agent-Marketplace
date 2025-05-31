import prisma from './prisma';

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
  const currentMetrics = await prisma.agentMetrics.findUnique({
    where: { agentId },
    select: { avgResponseTime: true },
  });
  const newAvgResponseTime = currentMetrics
    ? (currentMetrics.avgResponseTime + responseTime) / 2
    : responseTime;

  await prisma.agentMetrics.upsert({
    where: { agentId },
    update: {
      requests: { increment: 1 },
      errors: { increment: success ? 0 : 1 },
      avgResponseTime: { set: newAvgResponseTime },
      lastActive: now,
    },
    create: {
      agentId,
      requests: 1,
      errors: success ? 0 : 1,
      avgResponseTime: responseTime,
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
  await prisma.agentLog.create({
    data: {
      agentId,
      level,
      message,
      metadata,
      timestamp: new Date(),
    },
  });
}

export async function getAgentMetrics(agentId: string): Promise<AgentMetrics | null> {
  const metrics = await prisma.agentMetrics.findUnique({
    where: { agentId },
  });

  if (!metrics) return null;

  return {
    requests: metrics.requests,
    errors: metrics.errors,
    avgResponseTime: metrics.avgResponseTime,
    lastActive: metrics.lastActive,
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

  const logs = await prisma.agentLog.findMany({
    where: {
      agentId,
      ...(level && { level }),
      ...(startDate && { timestamp: { gte: startDate } }),
      ...(endDate && { timestamp: { lte: endDate } }),
    },
    orderBy: { timestamp: 'desc' },
    take: limit,
  });

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
  return prisma.agentFeedback.create({
    data: {
      agentId,
      userId,
      rating,
      comment,
    },
  });
}

export async function getAgentFeedback(agentId: string) {
  return prisma.agentFeedback.findMany({
    where: { agentId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
} 