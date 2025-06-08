import { prisma } from './db';
import type { WorkflowSchedule } from '@prisma/client';

interface ScheduleConfig {
  cron: string;
  timezone: string;
  input: any;
}

interface CreateScheduleData {
  workflowId: string;
  config: ScheduleConfig;
  userId: string;
}

interface WorkflowScheduleWithConfig extends WorkflowSchedule {
  config: ScheduleConfig;
}

export async function createSchedule(data: CreateScheduleData): Promise<WorkflowSchedule> {
  return prisma.workflowSchedule.create({
    data: {
      workflowId: data.workflowId,
      cronExpression: data.config.cron,
      timezone: data.config.timezone,
      config: {
        input: data.config.input
      } as any,
      isActive: true
    }
  });
}

export async function getScheduleById(id: string): Promise<WorkflowSchedule | null> {
  return prisma.workflowSchedule.findUnique({
    where: { id }
  });
}

export async function getSchedulesByWorkflow(workflowId: string): Promise<WorkflowSchedule[]> {
  return prisma.workflowSchedule.findMany({
    where: { workflowId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getSchedulesByUser(userId: string): Promise<WorkflowSchedule[]> {
  return prisma.workflowSchedule.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateSchedule(
  id: string,
  data: Partial<CreateScheduleData>
): Promise<WorkflowSchedule> {
  return prisma.workflowSchedule.update({
    where: { id },
    data: {
      ...(data.workflowId && { workflowId: data.workflowId }),
      ...(data.config && {
        cronExpression: data.config.cron,
        timezone: data.config.timezone,
        config: {
          input: data.config.input
        } as any
      })
    }
  });
}

export async function deleteSchedule(id: string): Promise<void> {
  await prisma.workflowSchedule.delete({
    where: { id }
  });
}

export async function pauseSchedule(id: string): Promise<WorkflowSchedule> {
  return prisma.workflowSchedule.update({
    where: { id },
    data: { isActive: false }
  });
}

export async function resumeSchedule(id: string): Promise<WorkflowSchedule> {
  return prisma.workflowSchedule.update({
    where: { id },
    data: { isActive: true }
  });
}

export async function getNextExecutionTime(schedule: WorkflowScheduleWithConfig): Promise<Date | null> {
  // This is a placeholder for actual cron expression parsing and next execution time calculation
  // In a real implementation, you would use a cron library to calculate the next execution time
  return null;
}

export async function executeScheduledWorkflows(): Promise<void> {
  const schedules = await prisma.workflowSchedule.findMany({
    where: { isActive: true }
  });

  const now = new Date();

  for (const schedule of schedules) {
    const scheduleWithConfig = schedule as WorkflowScheduleWithConfig;
    const nextExecution = await getNextExecutionTime(scheduleWithConfig);
    if (nextExecution && nextExecution <= now) {
      // Execute the workflow
      await prisma.workflowExecution.create({
        data: {
          workflowId: schedule.workflowId,
          input: scheduleWithConfig.config.input,
          status: 'pending',
          steps: []
        }
      });
    }
  }
} 