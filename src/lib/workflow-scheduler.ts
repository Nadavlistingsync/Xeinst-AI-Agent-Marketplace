import { prisma } from '@/types/prisma';
import { WorkflowSchedule } from '@prisma/client';

export interface ScheduleConfig {
  cronExpression: string;
  timezone: string;
}

export async function createSchedule(
  workflowId: string,
  data: ScheduleConfig
): Promise<WorkflowSchedule> {
  return prisma.workflowSchedule.create({
    data: {
      workflowId,
      cronExpression: data.cronExpression,
      timezone: data.timezone,
      isActive: true,
    },
  });
}

export async function updateSchedule(
  scheduleId: string,
  data: Partial<ScheduleConfig> & { isActive?: boolean }
): Promise<WorkflowSchedule> {
  return prisma.workflowSchedule.update({
    where: { id: scheduleId },
    data: {
      cronExpression: data.cronExpression,
      timezone: data.timezone,
      isActive: data.isActive,
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
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function pauseSchedule(scheduleId: string): Promise<WorkflowSchedule> {
  return prisma.workflowSchedule.update({
    where: { id: scheduleId },
    data: { isActive: false },
  });
}

export async function resumeSchedule(scheduleId: string): Promise<WorkflowSchedule> {
  return prisma.workflowSchedule.update({
    where: { id: scheduleId },
    data: { isActive: true },
  });
}

export async function getNextExecutionTime(scheduleId: string): Promise<Date | null> {
  const schedule = await prisma.workflowSchedule.findUnique({
    where: { id: scheduleId },
  });
  if (!schedule?.cronExpression) {
    return null;
  }
  
  // Simple cron expression parser
  const parseCronExpression = (expression: string): Date => {
    const parts = expression.split(' ');
    const [minute, hour, day, month] = parts;
    
    const now = new Date();
    const next = new Date(now);
    
    // Set to next occurrence based on cron expression
    if (minute !== '*') {
      next.setMinutes(parseInt(minute));
    }
    if (hour !== '*') {
      next.setHours(parseInt(hour));
    }
    if (day !== '*') {
      next.setDate(parseInt(day));
    }
    if (month !== '*') {
      next.setMonth(parseInt(month) - 1); // Month is 0-indexed
    }
    
    // If the calculated time is in the past, move to next occurrence
    if (next <= now) {
      next.setMinutes(next.getMinutes() + 1);
    }
    
    return next;
  };
  
  return parseCronExpression(schedule.cronExpression);
}

export async function executeScheduledWorkflows(): Promise<void> {
  const schedules = await prisma.workflowSchedule.findMany({
    where: { isActive: true }
  });

  const now = new Date();

  for (const schedule of schedules) {
    const nextExecution = await getNextExecutionTime(schedule.id);
    if (nextExecution && nextExecution <= now) {
      // Get the latest workflow version
      const workflow = await prisma.workflow.findUnique({
        where: { id: schedule.workflowId },
        include: {
          versions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (workflow?.versions[0]) {
        // Execute the workflow with the latest version
        await prisma.workflowExecution.create({
          data: {
            workflowId: schedule.workflowId,
            versionId: workflow.versions[0].id,
            input: {},
            status: 'pending',
            startedAt: new Date()
          }
        });
      }
    }
  }
} 