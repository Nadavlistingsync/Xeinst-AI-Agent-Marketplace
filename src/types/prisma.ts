import { PrismaClient, Prisma } from '@prisma/client';

// Re-export all types from Prisma
export type {
  User,
  Product,
  Deployment,
  AgentFeedback,
  Review,
  Purchase,
  Earning,
  Notification,
  AgentMetrics,
  File,
} from '.prisma/client';

// Re-export all enums from Prisma
export {
  UserRole,
  SubscriptionTier,
  DeploymentStatus,
  NotificationType,
  ProductStatus,
  ProductAccessLevel,
  ProductLicenseType,
} from '.prisma/client';

// Export Prisma namespace
export { Prisma } from '.prisma/client';

// Export PrismaClient
export { PrismaClient }; 