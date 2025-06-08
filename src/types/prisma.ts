import { PrismaClient } from '@prisma/client';
import type {
  User,
  UserRole,
  Product,
  ProductStatus,
  ProductAccessLevel,
  ProductLicenseType,
  Deployment,
  DeploymentStatus,
  AgentFeedback,
  Review,
  Purchase,
  Earning,
  Notification,
  NotificationType,
  File,
  Workflow,
  WorkflowVersion,
  WorkflowExecution,
  WorkflowSchedule,
  WorkflowTrigger,
  WorkflowWebhook,
  Rating,
  Webhook,
  Prisma
} from '@prisma/client';

// Export all types
export type {
  User,
  UserRole,
  Product,
  ProductStatus,
  ProductAccessLevel,
  ProductLicenseType,
  Deployment,
  DeploymentStatus,
  AgentFeedback,
  Review,
  Purchase,
  Earning,
  Notification,
  NotificationType,
  File,
  Workflow,
  WorkflowVersion,
  WorkflowExecution,
  WorkflowSchedule,
  WorkflowTrigger,
  WorkflowWebhook,
  Rating,
  Webhook,
  Prisma
};

// Create a singleton instance of PrismaClient
declare global {
  var prisma: PrismaClient | undefined;
}

const globalForPrisma = globalThis as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} 