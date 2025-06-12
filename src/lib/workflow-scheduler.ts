import { prisma } from '@/types/prisma';
import { WorkflowSchedule, WorkflowScheduleStatus } from '@prisma/client';

export interface ScheduleConfig {
  cronExpression: string;
  timezone: string;
  input?: Record<string, any>;
}

export async function createSchedule(
  workflowId: string,
  data: {
    name: string;
    description?: string;
    config: ScheduleConfig;
  }
): Promise<WorkflowSchedule> {
  return prisma.workflowSchedule.create({
    data: {
      workflowId,
      name: data.name,
      description: data.description,
      status: 'ACTIVE',
      metadata: {
        cronExpression: data.config.cronExpression,
        timezone: data.config.timezone,
        input: data.config.input ?? {},
      },
    },
  });
}

export async function updateSchedule(
  scheduleId: string,
  data: {
    name?: string;
    description?: string;
    config?: ScheduleConfig;
    status?: WorkflowScheduleStatus;
  }
): Promise<WorkflowSchedule> {
  return prisma.workflowSchedule.update({
    where: { id: scheduleId },
    data: {
      name: data.name,
      description: data.description,
      status: data.status,
      metadata: data.config ? {
        cronExpression: data.config.cronExpression,
        timezone: data.config.timezone,
        input: data.config.input ?? {},
      } : undefined,
    },
  });
}

export async function deleteSchedule(scheduleId: string): Promise<WorkflowSchedule> {
  return prisma.workflowSchedule.delete({
    where: { id: scheduleId },
  });
}

export async function getSchedule(scheduleId: string): Promise<WorkflowSchedule | null> {
  return prisma.workflowSchedule.findUnique({
    where: { id: scheduleId },
  });
}

export async function getSchedulesByWorkflow(workflowId: string): Promise<WorkflowSchedule[]> {
  return prisma.workflowSchedule.findMany({
    where: { workflowId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getActiveSchedules(): Promise<WorkflowSchedule[]> {
  return prisma.workflowSchedule.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function pauseSchedule(scheduleId: string): Promise<WorkflowSchedule> {
  return prisma.workflowSchedule.update({
    where: { id: scheduleId },
    data: { status: 'PAUSED' },
  });
}

export async function resumeSchedule(scheduleId: string): Promise<WorkflowSchedule> {
  return prisma.workflowSchedule.update({
    where: { id: scheduleId },
    data: { status: 'ACTIVE' },
  });
}

export async function getNextExecutionTime(scheduleId: string): Promise<Date | null> {
  const schedule = await prisma.workflowSchedule.findUnique({
    where: { id: scheduleId },
    select: { metadata: true },
  });

  if (!schedule?.metadata?.cronExpression) {
    return null;
  }

  // TODO: Implement cron expression parsing and next execution time calculation
  return new Date(Date.now() + 3600000); // Placeholder: 1 hour from now
}

export async function executeScheduledWorkflows(): Promise<void> {
  const schedules = await prisma.workflowSchedule.findMany({
    where: { isActive: true }
  });

  const now = new Date();

  for (const schedule of schedules) {
    const scheduleWithConfig = schedule as WorkflowScheduleWithConfig;
    const nextExecution = await getNextExecutionTime();
    if (nextExecution && nextExecution <= now) {
      // Execute the workflow
      await prisma.workflowExecution.create({
        data: {
          workflowId: schedule.workflowId,
          input: scheduleWithConfig.config.input,
          status: 'PENDING',
          versionId: schedule.workflowId,
          startedAt: new Date()
        }
      });
    }
  }
} 
} 