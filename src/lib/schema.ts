import { Prisma } from '@prisma/client';

export const userSchema = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  subscriptionTier: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const deploymentSchema = {
  id: true,
  name: true,
  description: true,
  status: true,
  environment: true,
  accessLevel: true,
  licenseType: true,
  deployedBy: true,
  framework: true,
  modelType: true,
  version: true,
  source: true,
  requirements: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const agentSchema = {
  id: true,
  name: true,
  description: true,
  status: true,
  type: true,
  capabilities: true,
  configuration: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const agentFeedbackSchema = {
  id: true,
  agentId: true,
  userId: true,
  rating: true,
  comment: true,
  sentimentScore: true,
  categories: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const agentLogSchema = {
  id: true,
  agentId: true,
  level: true,
  message: true,
  metadata: true,
  timestamp: true,
} as const;

export const agentMetricSchema = {
  id: true,
  agentId: true,
  name: true,
  value: true,
  timestamp: true,
} as const;

export const notificationSchema = {
  id: true,
  userId: true,
  type: true,
  message: true,
  read: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const productSchema = {
  id: true,
  name: true,
  description: true,
  longDescription: true,
  price: true,
  currency: true,
  features: true,
  documentation: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type User = Prisma.UserGetPayload<{ select: typeof userSchema }>;
export type Deployment = Prisma.DeploymentGetPayload<{ select: typeof deploymentSchema }>;
export type Agent = Prisma.AgentGetPayload<{ select: typeof agentSchema }>;
export type AgentFeedback = Prisma.AgentFeedbackGetPayload<{ select: typeof agentFeedbackSchema }>;
export type AgentLog = Prisma.AgentLogGetPayload<{ select: typeof agentLogSchema }>;
export type AgentMetric = Prisma.AgentMetricsGetPayload<{ select: typeof agentMetricSchema }>;
export type Notification = Prisma.NotificationGetPayload<{ select: typeof notificationSchema }>;
export type Product = Prisma.ProductGetPayload<{ select: typeof productSchema }>;

export type DeploymentCreateInput = Prisma.DeploymentCreateInput;
export type DeploymentUpdateInput = Prisma.DeploymentUpdateInput;
export type DeploymentWhereInput = Prisma.DeploymentWhereInput;
export type DeploymentWhereUniqueInput = Prisma.DeploymentWhereUniqueInput;
export type DeploymentOrderByWithRelationInput = Prisma.DeploymentOrderByWithRelationInput;
export type DeploymentInclude = Prisma.DeploymentInclude;

export type AgentFeedbackCreateInput = Prisma.AgentFeedbackCreateInput;
export type AgentFeedbackUpdateInput = Prisma.AgentFeedbackUpdateInput;
export type AgentFeedbackWhereInput = Prisma.AgentFeedbackWhereInput;
export type AgentFeedbackWhereUniqueInput = Prisma.AgentFeedbackWhereUniqueInput;
export type AgentFeedbackOrderByWithRelationInput = Prisma.AgentFeedbackOrderByWithRelationInput;
export type AgentFeedbackInclude = Prisma.AgentFeedbackInclude;

export type AgentLogCreateInput = Prisma.AgentLogCreateInput;
export type AgentLogUpdateInput = Prisma.AgentLogUpdateInput;
export type AgentLogWhereInput = Prisma.AgentLogWhereInput;
export type AgentLogWhereUniqueInput = Prisma.AgentLogWhereUniqueInput;
export type AgentLogOrderByWithRelationInput = Prisma.AgentLogOrderByWithRelationInput;
export type AgentLogInclude = Prisma.AgentLogInclude;

export type AgentMetricCreateInput = Prisma.AgentMetricsCreateInput;
export type AgentMetricUpdateInput = Prisma.AgentMetricsUpdateInput;
export type AgentMetricWhereInput = Prisma.AgentMetricsWhereInput;
export type AgentMetricWhereUniqueInput = Prisma.AgentMetricsWhereUniqueInput;
export type AgentMetricOrderByWithRelationInput = Prisma.AgentMetricsOrderByWithRelationInput;
export type AgentMetricInclude = Prisma.AgentMetricsInclude;

export type NotificationCreateInput = Prisma.NotificationCreateInput;
export type NotificationUpdateInput = Prisma.NotificationUpdateInput;
export type NotificationWhereInput = Prisma.NotificationWhereInput;
export type NotificationWhereUniqueInput = Prisma.NotificationWhereUniqueInput;
export type NotificationOrderByWithRelationInput = Prisma.NotificationOrderByWithRelationInput;
export type NotificationInclude = Prisma.NotificationInclude;

export type ProductCreateInput = Prisma.ProductCreateInput;
export type ProductUpdateInput = Prisma.ProductUpdateInput;
export type ProductWhereInput = Prisma.ProductWhereInput;
export type ProductWhereUniqueInput = Prisma.ProductWhereUniqueInput;
export type ProductOrderByWithRelationInput = Prisma.ProductOrderByWithRelationInput;
export type ProductInclude = Prisma.ProductInclude; 