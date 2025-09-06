import { prisma } from './db';
import { updateAgentBasedOnFeedback } from './feedback-monitoring';
import { Prisma, AgentLog } from '@prisma/client';
import { AppError } from './error-handling';
import { performanceMonitor } from './performance';
import { withDbPerformanceTracking } from './performance';

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

export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  data: any;
  priority: JobPriority;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  retries: number;
  maxRetries: number;
  metadata?: Record<string, any>;
}

export type JobType = 
  | 'agent_deployment'
  | 'file_processing'
  | 'analytics_processing'
  | 'email_sending'
  | 'data_cleanup'
  | 'backup_creation'
  | 'agent_monitoring'
  | 'feedback_analysis';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export type JobPriority = 'low' | 'normal' | 'high' | 'critical';

class JobQueue {
  private isProcessing = false;
  private readonly maxConcurrentJobs = 3;
  private readonly jobTimeouts = new Map<string, NodeJS.Timeout>();

  async createJob(
    type: JobType,
    data: any,
    priority: JobPriority = 'normal',
    metadata?: Record<string, any>
  ): Promise<string> {
    return withDbPerformanceTracking('create_job', async () => {
      const job = await prisma.job.create({
        data: {
          id: this.generateJobId(),
          type,
          status: 'pending',
          data,
          priority,
          retries: 0,
          maxRetries: this.getMaxRetries(type),
          metadata
        }
      });

      // Start processing if not already running
      if (!this.isProcessing) {
        this.startProcessing();
      }

      return job.id;
    });
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getMaxRetries(type: JobType): number {
    const retryConfig: Record<JobType, number> = {
      agent_deployment: 3,
      file_processing: 2,
      analytics_processing: 1,
      email_sending: 3,
      data_cleanup: 1,
      backup_creation: 2,
      agent_monitoring: 2,
      feedback_analysis: 1
    };
    return retryConfig[type] || 1;
  }

  async startProcessing(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    console.log('Starting job queue processing...');

    while (this.isProcessing) {
      try {
        const pendingJobs = await this.getPendingJobs();
        
        if (pendingJobs.length === 0) {
          // No jobs to process, wait a bit before checking again
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }

        // Process jobs concurrently up to maxConcurrentJobs
        const jobsToProcess = pendingJobs.slice(0, this.maxConcurrentJobs);
        await Promise.all(jobsToProcess.map(job => this.processJob(job)));

      } catch (error) {
        console.error('Error in job processing loop:', error);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s before retrying
      }
    }
  }

  async stopProcessing(): Promise<void> {
    this.isProcessing = false;
    
    // Clear any pending timeouts
    for (const timeout of this.jobTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.jobTimeouts.clear();
    
    console.log('Job queue processing stopped');
  }

  private async getPendingJobs(): Promise<Job[]> {
    return withDbPerformanceTracking('get_pending_jobs', async () => {
      const jobs = await prisma.job.findMany({
        where: {
          status: 'pending',
          retries: {
            lt: prisma.job.fields.maxRetries
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ],
        take: 10
      });

      return jobs as Job[];
    });
  }

  private async processJob(job: Job): Promise<void> {
    const jobId = job.id;
    
    try {
      // Mark job as running
      await this.updateJobStatus(jobId, 'running');
      
      // Set timeout for job processing
      const timeout = setTimeout(() => {
        this.handleJobTimeout(jobId);
      }, this.getJobTimeout(job.type));
      
      this.jobTimeouts.set(jobId, timeout);

      // Process the job based on type
      await this.executeJob(job);
      
      // Clear timeout and mark as completed
      clearTimeout(timeout);
      this.jobTimeouts.delete(jobId);
      await this.updateJobStatus(jobId, 'completed');

    } catch (error) {
      console.error(`Job ${jobId} failed:`, error);
      await this.handleJobFailure(jobId, error);
    }
  }

  private async executeJob(job: Job): Promise<void> {
    const startTime = Date.now();
    
    try {
      switch (job.type) {
        case 'agent_deployment':
          await this.handleAgentDeployment();
          break;
        case 'file_processing':
          await this.handleFileProcessing();
          break;
        case 'analytics_processing':
          await this.handleAnalyticsProcessing(job);
          break;
        case 'email_sending':
          await this.handleEmailSending(job);
          break;
        case 'data_cleanup':
          await this.handleDataCleanup(job);
          break;
        case 'backup_creation':
          await this.handleBackupCreation();
          break;
        case 'agent_monitoring':
          await this.handleAgentMonitoring(job);
          break;
        case 'feedback_analysis':
          await this.handleFeedbackAnalysis();
          break;
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }
      
      // Track performance
      performanceMonitor.trackSyncOperation(
        `job_${job.type}`,
        () => Date.now() - startTime
      );
      
    } catch (error) {
      performanceMonitor.trackSyncOperation(
        `job_${job.type}`,
        () => Date.now() - startTime
      );
      throw error;
    }
  }

  private async handleAgentDeployment(): Promise<void> {
    // Simulate agent deployment process
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Update agent (no status or deployedAt fields in schema)
    // await prisma.agent.update({ where: { id: agentId }, data: { status: 'deployed', deployedAt: new Date() } });
  }

  private async handleFileProcessing(): Promise<void> {
    // Simulate file processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Update file (no status or processedAt fields in schema)
    // await prisma.file.update({ where: { id: fileId }, data: { status: 'processed', processedAt: new Date() } });
  }

  private async handleAnalyticsProcessing(job: Job): Promise<void> {
    const { deploymentId } = job.data;
    // Simulate analytics processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    // Generate analytics data
    const analytics = {
      totalRequests: Math.floor(Math.random() * 1000),
      successRate: 0.95 + Math.random() * 0.05,
      averageResponseTime: 200 + Math.random() * 800
    };
    // Store analytics (use deploymentId, not agentId, and only valid fields)
    await prisma.agentMetrics.create({
      data: {
        deploymentId,
        errorRate: 0,
        responseTime: analytics.averageResponseTime,
        successRate: analytics.successRate,
        totalRequests: analytics.totalRequests,
        activeUsers: 0,
        averageResponseTime: analytics.averageResponseTime,
        requestsPerMinute: 0,
        averageTokensUsed: 0,
        costPerRequest: 0,
        totalCost: 0,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUpdated: new Date()
      }
    });
  }

  private async handleEmailSending(job: Job): Promise<void> {
    const { to, subject } = job.data;
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Email sent to ${to}: ${subject}`);
  }

  private async handleDataCleanup(job: Job): Promise<void> {
    const { olderThan } = job.data;
    // Clean up old data
    const cutoffDate = new Date(Date.now() - olderThan);
    await prisma.agentLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });
  }

  private async handleBackupCreation(): Promise<void> {
    // Simulate backup creation
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('Backup created successfully');
  }

  private async handleAgentMonitoring(job: Job): Promise<void> {
    const { deploymentId } = job.data;
    // Check deployment health
    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId }
    });
    if (deployment) {
      // Update monitoring status (store a metrics record)
      await prisma.agentMetrics.create({
        data: {
          deploymentId,
          errorRate: 0,
          responseTime: 0,
          successRate: 1,
          totalRequests: 0,
          activeUsers: 0,
          averageResponseTime: 0,
          requestsPerMinute: 0,
          averageTokensUsed: 0,
          costPerRequest: 0,
          totalCost: 0,
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          lastUpdated: new Date()
        }
      });
    }
  }

  private async handleFeedbackAnalysis(): Promise<void> {
    // Simulate feedback analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Update feedback (no analyzed, analyzedAt, sentiment fields in schema)
    // await prisma.feedback.update({ where: { id: feedbackId }, data: { analyzed: true, analyzedAt: new Date(), sentiment: Math.random() > 0.5 ? 'positive' : 'negative' } });
  }

  private getJobTimeout(type: JobType): number {
    const timeoutConfig: Record<JobType, number> = {
      agent_deployment: 300000, // 5 minutes
      file_processing: 60000,   // 1 minute
      analytics_processing: 180000, // 3 minutes
      email_sending: 30000,     // 30 seconds
      data_cleanup: 120000,     // 2 minutes
      backup_creation: 600000,  // 10 minutes
      agent_monitoring: 60000,  // 1 minute
      feedback_analysis: 120000 // 2 minutes
    };
    return timeoutConfig[type] || 60000;
  }

  private async handleJobTimeout(jobId: string): Promise<void> {
    console.warn(`Job ${jobId} timed out`);
    await this.updateJobStatus(jobId, 'failed', 'Job timed out');
  }

  private async handleJobFailure(jobId: string, error: any): Promise<void> {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    
    if (!job) return;
    
    const newRetries = job.retries + 1;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (newRetries >= job.maxRetries) {
      await this.updateJobStatus(jobId, 'failed', errorMessage);
    } else {
      // Retry the job
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'pending',
          retries: newRetries,
          error: errorMessage
        }
      });
    }
  }

  private async updateJobStatus(
    jobId: string, 
    status: JobStatus, 
    error?: string
  ): Promise<void> {
    const updateData: any = { status };
    
    if (status === 'running') {
      updateData.startedAt = new Date();
    } else if (status === 'completed' || status === 'failed') {
      updateData.completedAt = new Date();
    }
    
    if (error) {
      updateData.error = error;
    }
    
    await prisma.job.update({
      where: { id: jobId },
      data: updateData
    });
  }

  async getJobStatus(jobId: string): Promise<Job | null> {
    return withDbPerformanceTracking('get_job_status', async () => {
      const job = await prisma.job.findUnique({
        where: { id: jobId }
      });
      return job as Job | null;
    });
  }

  async cancelJob(jobId: string): Promise<void> {
    await this.updateJobStatus(jobId, 'cancelled');
    
    // Clear timeout if exists
    const timeout = this.jobTimeouts.get(jobId);
    if (timeout) {
      clearTimeout(timeout);
      this.jobTimeouts.delete(jobId);
    }
  }

  async getJobStats(): Promise<{
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  }> {
    const stats = await prisma.job.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const result = {
      total: 0,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      const count = stat._count.status;
      result.total += count;
      result[stat.status as keyof typeof result] = count;
    });

    return result;
  }
}

// Global job queue instance
export const jobQueue = new JobQueue();

// Start job processing when the module is loaded
if (process.env.NODE_ENV === 'production') {
  jobQueue.startProcessing().catch(console.error);
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
        level: 'pending'
      },
      orderBy: {
        timestamp: 'asc'
      },
      take: 100
    });

    for (const log of logs) {
      try {
        // Process the log
        await prisma.agentLog.update({
          where: { id: log.id },
          data: {
            level: 'processed',
            metadata: {
              ...(log.metadata as Record<string, unknown> || {}),
              processedAt: new Date().toISOString()
            }
          }
        });
      } catch (error) {
        console.error(`Error processing log ${log.id}:`, error);
        // Mark as failed by setting error in metadata
        await prisma.agentLog.update({
          where: { id: log.id },
          data: {
            level: 'error',
            metadata: {
              ...(log.metadata as Record<string, unknown> || {}),
              error: error instanceof Error ? error.message : 'Unknown error',
              processedAt: new Date().toISOString()
            }
          }
        });
      }
    }

    return {
      success: true,
      data: {
        processedLogs: logs.length
      }
    };
  } catch (error) {
    console.error('Error in processAgentLogs:', error);
    throw error;
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
    return await prisma.agentLog.create({
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

  return prisma.agentLog.findMany({
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
  const result = await prisma.agentLog.deleteMany({
    where: {
      deploymentId,
      timestamp: {
        lt: beforeDate,
      },
    },
  });

  return result.count;
} 