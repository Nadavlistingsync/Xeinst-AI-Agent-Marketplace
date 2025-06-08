import { prisma } from './db';
import type { WorkflowExecution } from '@/types/prisma';

interface WorkflowMetrics {
  totalExecutions: number;
  successRate: number;
  averageDuration: number;
  errorRate: number;
  statusDistribution: {
    pending: number;
    running: number;
    completed: number;
    failed: number;
  };
  timeSeriesData: {
    date: string;
    count: number;
    successRate: number;
    averageDuration: number;
  }[];
}

export async function getWorkflowMetrics(workflowId: string): Promise<WorkflowMetrics> {
  const executions = await prisma.workflowExecution.findMany({
    where: { workflowId },
    orderBy: { createdAt: 'desc' }
  });

  const totalExecutions = executions.length;
  const completedExecutions = executions.filter(e => e.status === 'completed');
  const failedExecutions = executions.filter(e => e.status === 'failed');

  const successRate = totalExecutions > 0
    ? (completedExecutions.length / totalExecutions) * 100
    : 0;

  const errorRate = totalExecutions > 0
    ? (failedExecutions.length / totalExecutions) * 100
    : 0;

  const averageDuration = completedExecutions.length > 0
    ? completedExecutions.reduce((sum, e) => {
        const duration = e.completedAt && e.startedAt
          ? e.completedAt.getTime() - e.startedAt.getTime()
          : 0;
        return sum + duration;
      }, 0) / completedExecutions.length
    : 0;

  const statusDistribution = {
    pending: executions.filter(e => e.status === 'pending').length,
    running: executions.filter(e => e.status === 'running').length,
    completed: completedExecutions.length,
    failed: failedExecutions.length
  };

  const timeSeriesData = analyzeTimeSeriesData(executions);

  return {
    totalExecutions,
    successRate,
    averageDuration,
    errorRate,
    statusDistribution,
    timeSeriesData
  };
}

function analyzeTimeSeriesData(executions: WorkflowExecution[]): WorkflowMetrics['timeSeriesData'] {
  const dailyData = new Map<string, {
    count: number;
    completed: number;
    duration: number;
  }>();

  executions.forEach(execution => {
    const date = execution.createdAt.toISOString().split('T')[0];
    const data = dailyData.get(date) || { count: 0, completed: 0, duration: 0 };

    data.count++;
    if (execution.status === 'completed') {
      data.completed++;
      if (execution.completedAt && execution.startedAt) {
        data.duration += execution.completedAt.getTime() - execution.startedAt.getTime();
      }
    }

    dailyData.set(date, data);
  });

  return Array.from(dailyData.entries()).map(([date, data]) => ({
    date,
    count: data.count,
    successRate: data.count > 0 ? (data.completed / data.count) * 100 : 0,
    averageDuration: data.completed > 0 ? data.duration / data.completed : 0
  }));
}

export async function getExecutionHistory(workflowId: string): Promise<WorkflowExecution[]> {
  return prisma.workflowExecution.findMany({
    where: { workflowId },
    orderBy: { createdAt: 'desc' },
    take: 100
  });
}

export async function getErrorDetails(executionId: string): Promise<{
  error: string;
  steps: any[];
}> {
  const execution = await prisma.workflowExecution.findUnique({
    where: { id: executionId }
  });

  if (!execution) {
    throw new Error('Execution not found');
  }

  return {
    error: execution.error || 'No error details available',
    steps: execution.steps as any[]
  };
} 