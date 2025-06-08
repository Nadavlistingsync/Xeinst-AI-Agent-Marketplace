import { prisma } from './db';
import { updateAgentBasedOnFeedback } from './feedback-monitoring';
import { Prisma, AgentLog, AgentFeedback, Deployment } from '../types/prisma';
import type { AgentLog as AgentLogType } from '@/types/prisma';

interface JobResult {
  success: boolean;
  error?: string;
  data?: any;
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
        categories: f.categories as Record<string, unknown> | null
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
          processed: true
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

      const errorCount = logs.filter((log: AgentLogType) => log.level === 'error').length;
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
    categories: feedback.categories as Record<string, unknown> | null
  });
} 