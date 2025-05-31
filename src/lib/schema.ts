import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Schema definitions
export const userSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  image: z.string().nullable(),
  role: z.string(),
  subscriptionTier: z.string(),
  emailVerified: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const deploymentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.string(),
  accessLevel: z.string(),
  licenseType: z.string(),
  environment: z.string(),
  config: z.record(z.any()),
  startDate: z.date(),
  endDate: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const agentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  longDescription: z.string().nullable(),
  documentation: z.string().nullable(),
  category: z.string(),
  framework: z.string(),
  requirements: z.array(z.string()),
  source: z.string(),
  version: z.string(),
  createdBy: z.string(),
  accessLevel: z.string(),
  licenseType: z.string(),
  environment: z.string(),
  fileUrl: z.string(),
  imageUrl: z.string().nullable(),
  status: z.string(),
  rating: z.number(),
  downloadCount: z.number(),
  isPublic: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const agentFeedbackSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  userId: z.string(),
  rating: z.number(),
  comment: z.string().nullable(),
  sentimentScore: z.number().nullable(),
  categories: z.array(z.string()),
  creatorResponse: z.string().nullable(),
  responseDate: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const agentLogSchema = z.object({
  id: z.string(),
  deploymentId: z.string(),
  agentId: z.string(),
  level: z.string(),
  message: z.string(),
  metadata: z.record(z.any()),
  timestamp: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const agentMetricsSchema = z.object({
  id: z.string(),
  deploymentId: z.string(),
  agentId: z.string(),
  totalRequests: z.number(),
  averageResponseTime: z.number(),
  errorRate: z.number(),
  successRate: z.number(),
  activeUsers: z.number(),
  cpuUsage: z.number(),
  memoryUsage: z.number(),
  lastUpdated: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  longDescription: z.string().nullable(),
  price: z.number(),
  currency: z.string(),
  images: z.array(z.string()),
  seller: z.string(),
  stock: z.number(),
  rating: z.number(),
  downloadCount: z.number(),
  isPublic: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const reviewSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  rating: z.number(),
  comment: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const purchaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  amount: z.number(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const earningSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  amount: z.number(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type Deployment = z.infer<typeof deploymentSchema>;
export type Agent = z.infer<typeof agentSchema>;
export type AgentFeedback = z.infer<typeof agentFeedbackSchema>;
export type AgentLog = z.infer<typeof agentLogSchema>;
export type AgentMetrics = z.infer<typeof agentMetricsSchema>;
export type Product = z.infer<typeof productSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Purchase = z.infer<typeof purchaseSchema>;
export type Earning = z.infer<typeof earningSchema>;
export type Category = z.infer<typeof categorySchema>;

// Input types
export type UserInput = z.infer<typeof userSchema>;
export type DeploymentInput = z.infer<typeof deploymentSchema>;
export type AgentInput = z.infer<typeof agentSchema>;
export type AgentFeedbackInput = z.infer<typeof agentFeedbackSchema>;
export type AgentLogInput = z.infer<typeof agentLogSchema>;
export type AgentMetricsInput = z.infer<typeof agentMetricsSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type PurchaseInput = z.infer<typeof purchaseSchema>;
export type EarningInput = z.infer<typeof earningSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;

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

export type AgentMetricsCreateInput = Prisma.AgentMetricsCreateInput;
export type AgentMetricsUpdateInput = Prisma.AgentMetricsUpdateInput;
export type AgentMetricsWhereInput = Prisma.AgentMetricsWhereInput;
export type AgentMetricsWhereUniqueInput = Prisma.AgentMetricsWhereUniqueInput;
export type AgentMetricsOrderByWithRelationInput = Prisma.AgentMetricsOrderByWithRelationInput;
export type AgentMetricsInclude = Prisma.AgentMetricsInclude;

export type ProductCreateInput = Prisma.ProductCreateInput;
export type ProductUpdateInput = Prisma.ProductUpdateInput;
export type ProductWhereInput = Prisma.ProductWhereInput;
export type ProductWhereUniqueInput = Prisma.ProductWhereUniqueInput;
export type ProductOrderByWithRelationInput = Prisma.ProductOrderByWithRelationInput;
export type ProductInclude = Prisma.ProductInclude;

export type FeedbackAnalysis = {
  sentimentScore: number;
  positiveFeedback: number;
  negativeFeedback: number;
  totalFeedbacks: number;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
    average: number;
  };
  categories: Record<string, number>;
  trends: {
    sentiment: number;
    volume: number;
  };
};

export type FeedbackCategory = {
  id: string;
  name: string;
  description: string;
};

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
};

export type Order = {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}; 