import { prisma } from './db';
import { updateAgentBasedOnFeedback } from './feedback-monitoring';
import type { Prisma } from '../types/prisma';
import { AgentLog } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { AppError } from './error-handling';

const prismaClient = new PrismaClient();

interface JobResult {
  success: boolean;
  error?: string;
  data?: any;
}

interface AgentLogInput {
  deploymentId: string;
  level: 'info' | 'error' | 'warning';
  message: string;
  metadata?: Prisma.JsonValue;
}

export async function processFeedbackJob() {
  const feedback = await prisma.agentFeedback.findMany({
    include: {
      deployment: true,
    },
  });

  for (const f of feedback) {
    try {
      await updateAgentBasedOnFeedback(f.deploymentId, {
        ...f,
        sentimentScore: f.sentimentScore ?? 0,
        categories: f.categories as Prisma.JsonValue
      });
    } catch (error) {
      console.error(`Error processing feedback ${f.id}:`, error);
    }
  }
}

export async function processAgentLogs(): Promise<JobResult> {
  try {
    const logs = await prisma.agentLog.findMany({
      where: {
        processed: false
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    for (const log of logs) {
      await prisma.agentLog.update({
        where: {
          id: log.id
        },
        data: {
          // Remove processed if not in schema
        }
      });
    }

    return {
      success: true,
      data: {
        processedLogs: logs.length
      }
    };
  } catch (error) {
    console.error('Error processing agent logs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function cleanupOldLogs(): Promise<JobResult> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedLogs = await prisma.agentLog.deleteMany({
      where: {
        timestamp: {
          lt: thirtyDaysAgo
        }
      }
    });

    return {
      success: true,
      data: {
        deletedLogs: deletedLogs.count
      }
    };
  } catch (error) {
    console.error('Error cleaning up old logs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function updateAgentMetrics() {
  const deployments = await prisma.deployment.findMany({
    where: {
      status: 'active',
    },
  });

  for (const deployment of deployments) {
    try {
      const logs = await prisma.agentLog.findMany({
        where: {
          deploymentId: deployment.id,
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      const errorCount = logs.filter((log: AgentLog) => log.level === 'error').length;
      const totalRequests = logs.length;
      const errorRate = totalRequests > 0 ? errorCount / totalRequests : 0;
      const successRate = 1 - errorRate;

      await prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          health: {
            status: deployment.status,
            lastChecked: new Date(),
            metrics: {
              errorRate,
              responseTime: 0,
              successRate,
              totalRequests,
              activeUsers: 0,
            },
            logs: [],
          } as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      console.error(`Error updating metrics for deployment ${deployment.id}:`, error);
    }
  }
}

// Function to start the background job
export function startBackgroundJobs() {
  try {
    console.log('Starting background jobs...');
    
    // Run feedback analysis every 6 hours
    const interval = setInterval(async () => {
      try {
        await processFeedbackJob();
      } catch (error) {
        console.error('Error in scheduled feedback analysis:', error);
      }
    }, 6 * 60 * 60 * 1000);

    // Run initial analysis
    processFeedbackJob().catch(error => {
      console.error('Error in initial feedback analysis:', error);
    });

    // Return cleanup function
    return () => {
      clearInterval(interval);
    };
  } catch (error) {
    console.error('Error starting background jobs:', error);
    throw error;
  }
}

export async function processFeedback(agentId: string, feedbackId: string) {
  const feedback = await prisma.agentFeedback.findUnique({
    where: { id: feedbackId }
  });

  if (!feedback) {
    throw new Error('Feedback not found');
  }

  await updateAgentBasedOnFeedback(agentId, {
    ...feedback,
    sentimentScore: feedback.sentimentScore ?? 0,
    categories: feedback.categories as Prisma.JsonValue
  });
}

export async function createAgentLog(input: AgentLogInput): Promise<AgentLog> {
  try {
    return await prismaClient.agentLog.create({
      data: {
        deploymentId: input.deploymentId,
        level: input.level,
        message: input.message,
        metadata: input.metadata || {},
        timestamp: new Date(),
      },
    });
  } catch (error) {
    throw new AppError(
      'Failed to create agent log',
      500,
      'AGENT_LOG_ERROR',
      error
    );
  }
}

export async function getAgentLogs(
  deploymentId: string,
  options: {
    level?: 'info' | 'error' | 'warning';
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<AgentLog[]> {
  const { level, startDate, endDate, limit = 100 } = options;

  const where: Prisma.AgentLogWhereInput = {
    deploymentId,
    ...(level && { level }),
    ...(startDate && endDate && {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    }),
  };

  return prismaClient.agentLog.findMany({
    where,
    orderBy: {
      timestamp: 'desc',
    },
    take: limit,
  });
}

export async function deleteAgentLogs(
  deploymentId: string,
  beforeDate: Date
): Promise<number> {
  const result = await prismaClient.agentLog.deleteMany({
    where: {
      deploymentId,
      timestamp: {
        lt: beforeDate,
      },
    },
  });

  return result.count;
} 