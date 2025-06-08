import { prisma } from './db';
import type { WorkflowSchedule } from '@/types/prisma';

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

export async function createSchedule(data: CreateScheduleData): Promise<WorkflowSchedule> {
  return prisma.workflowSchedule.create({
    data: {
      workflowId: data.workflowId,
      cron: data.config.cron,
      timezone: data.config.timezone,
      input: data.config.input,
      userId: data.userId,
      status: 'active'
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
      ...data,
      config: data.config ? {
        cron: data.config.cron,
        timezone: data.config.timezone,
        input: data.config.input
      } : undefined
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
    data: { status: 'paused' }
  });
}

export async function resumeSchedule(id: string): Promise<WorkflowSchedule> {
  return prisma.workflowSchedule.update({
    where: { id },
    data: { status: 'active' }
  });
}

export async function getNextExecutionTime(schedule: WorkflowSchedule): Promise<Date | null> {
  // This is a placeholder for actual cron expression parsing and next execution time calculation
  // In a real implementation, you would use a cron library to calculate the next execution time
  return null;
}

export async function executeScheduledWorkflows(): Promise<void> {
  const schedules = await prisma.workflowSchedule.findMany({
    where: { status: 'active' }
  });

  const now = new Date();

  for (const schedule of schedules) {
    const nextExecution = await getNextExecutionTime(schedule);
    if (nextExecution && nextExecution <= now) {
      // Execute the workflow
      await prisma.workflowExecution.create({
        data: {
          workflowId: schedule.workflowId,
          input: schedule.input,
          userId: schedule.userId,
          status: 'pending',
          steps: []
        }
      });
    }
  }
} 