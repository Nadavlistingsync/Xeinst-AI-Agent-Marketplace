import { z } from 'zod';
import type { Prisma, Product, Purchase } from '@prisma/client';

// Helper function to convert Decimal to number
const decimalToNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    return (value as { toNumber(): number }).toNumber();
  }
  return 0;
};

// Enum types
export const SubscriptionTier = z.enum(['free', 'basic', 'premium']);
export const UserRole = z.enum(['user', 'admin', 'agent']);
export const DeploymentStatus = z.enum(['pending', 'deploying', 'active', 'failed', 'stopped']);
export const NotificationType = z.enum(['feedback_received', 'deployment_status', 'system_alert']);

// Base schemas
export const userSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  image: z.string().nullable(),
  role: UserRole,
  subscriptionTier: SubscriptionTier,
  emailVerified: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  password: z.string().nullable(),
});

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  description: z.string(),
  fileUrl: z.string(),
  rating: z.number(),
  downloadCount: z.number(),
  requirements: z.array(z.string()),
  longDescription: z.string().nullable(),
  price: z.number().transform(decimalToNumber),
  category: z.string(),
  tags: z.array(z.string()),
  version: z.string(),
  status: z.string(),
  accessLevel: z.string(),
  licenseType: z.string(),
  environment: z.string(),
  framework: z.string(),
  modelType: z.string(),
  createdBy: z.string(),
  earningsSplit: z.number().transform(decimalToNumber),
});

export const deploymentSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: DeploymentStatus,
  createdAt: z.date(),
  updatedAt: z.date(),
  description: z.string(),
  accessLevel: z.string(),
  licenseType: z.string(),
  environment: z.string(),
  framework: z.string(),
  modelType: z.string(),
  source: z.string(),
  deployedBy: z.string(),
  createdBy: z.string(),
  isPublic: z.boolean().default(true),
  version: z.string().default(''),
  tags: z.array(z.string()).default([]),
  earningsSplit: z.number().default(0),
  rating: z.number().default(0),
  totalRatings: z.number().default(0),
  downloadCount: z.number().default(0),
  startDate: z.date().default(() => new Date()),
  endDate: z.date().nullable().default(null),
  health: z.record(z.any()).default({}),
  config: z.record(z.any()).optional(),
});

export const agentFeedbackSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  rating: z.number(),
  deploymentId: z.string(),
  userId: z.string(),
  comment: z.string().nullable(),
  sentimentScore: z.number().nullable().transform(decimalToNumber),
  categories: z.record(z.any()).nullable(),
  creatorResponse: z.string().nullable(),
  responseDate: z.date().nullable(),
});

export const reviewSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  rating: z.number(),
  deploymentId: z.string(),
  userId: z.string(),
  comment: z.string(),
});

export const purchaseSchema = z.object({
  id: z.string(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  productId: z.string(),
  amount: z.number().transform(decimalToNumber),
  stripeTransferId: z.string().nullable(),
  paidAt: z.date().nullable(),
});

export const earningSchema = z.object({
  id: z.string(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  productId: z.string(),
  amount: z.number().transform(decimalToNumber),
  stripeTransferId: z.string().nullable(),
  paidAt: z.date().nullable(),
});

// Type exports (aliased to avoid conflicts with Prisma types)
export type AppUser = z.infer<typeof userSchema>;
export type AppProduct = z.infer<typeof productSchema>;
export type AppDeployment = z.infer<typeof deploymentSchema>;
export type AppAgentFeedback = z.infer<typeof agentFeedbackSchema>;
export type AppReview = z.infer<typeof reviewSchema>;
export type AppPurchase = z.infer<typeof purchaseSchema>;
export type AppEarning = z.infer<typeof earningSchema>;

// Input types (aliased)
export type AppUserInput = z.infer<typeof userSchema>;
export type AppProductInput = z.infer<typeof productSchema>;
export type AppDeploymentInput = z.infer<typeof deploymentSchema>;
export type AppAgentFeedbackInput = z.infer<typeof agentFeedbackSchema>;
export type AppReviewInput = z.infer<typeof reviewSchema>;
export type AppPurchaseInput = z.infer<typeof purchaseSchema>;
export type AppEarningInput = z.infer<typeof earningSchema>;

// Pagination and filtering
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  category?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

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
  status: DeploymentStatus,
  rating: z.number(),
  downloadCount: z.number(),
  isPublic: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const agentLogSchema = z.object({
  id: z.string(),
  deploymentId: z.string(),
  agentId: z.string(),
  level: z.string(),
  message: z.string(),
  metadata: z.record(z.any()).nullable(),
  timestamp: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const agentMetricsSchema = z.object({
  id: z.string(),
  deploymentId: z.string(),
  totalRequests: z.number(),
  averageResponseTime: z.number(),
  errorRate: z.number(),
  successRate: z.number(),
  activeUsers: z.number(),
  requestsPerMinute: z.number(),
  averageTokensUsed: z.number(),
  costPerRequest: z.number(),
  totalCost: z.number(),
  lastUpdated: z.date(),
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
export type Agent = z.infer<typeof agentSchema>;
export type AgentLog = z.infer<typeof agentLogSchema>;
export type AgentMetrics = z.infer<typeof agentMetricsSchema>;
export type Category = z.infer<typeof categorySchema>;

// Input types
export type AgentInput = z.infer<typeof agentSchema>;
export type AgentLogInput = z.infer<typeof agentLogSchema>;
export type AgentMetricsInput = z.infer<typeof agentMetricsSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;

// Prisma types
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

export type Notification = Prisma.NotificationGetPayload<{}>;

export type Order = {
  id: string;
  userId: string;
  productId: string;
  amount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface SearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface PriceRange {
  minPrice: number;
  maxPrice: number;
}

export interface RatingRange {
  minRating: number;
  maxRating: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface SearchOptions {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface FilterOptions {
  userId?: string;
  productId?: string;
  agentId?: string;
  status?: string;
  type?: string;
  level?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

export interface DateRangeOptions {
  startDate: Date;
  endDate: Date;
}

export interface PriceRangeOptions {
  minPrice: number;
  maxPrice: number;
}

export interface RatingRangeOptions {
  minRating: number;
  maxRating: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  filters: SearchOptions;
}

export interface FilterResult<T> {
  data: T[];
  total: number;
  filters: FilterOptions;
}

export interface SortResult<T> {
  data: T[];
  sort: SortOptions;
}

export interface DateRangeResult<T> {
  data: T[];
  range: DateRangeOptions;
}

export interface PriceRangeResult<T> {
  data: T[];
  range: PriceRangeOptions;
}

export interface RatingRangeResult<T> {
  data: T[];
  range: RatingRangeOptions;
}

export type File = Prisma.FileGetPayload<{}>;

// Extended types with number fields
export interface ProductWithNumbers extends Omit<Product, 'price' | 'earningsSplit'> {
  price: number;
  earningsSplit: number;
}

export interface PurchaseWithProduct extends Omit<Purchase, 'amount'> {
  amount: number;
  product: ProductWithNumbers;
}

export interface EarningWithNumber extends Omit<AppEarning, 'amount'> {
  amount: number;
}

export interface ReviewWithNumber extends Omit<AppReview, 'rating'> {
  rating: number;
}

export interface NotificationWithMetadata extends Notification {
  metadata: Record<string, any>;
}

export interface FileWithMetadata extends File {
  metadata: Record<string, any>;
}

export interface AgentFeedbackWithMetadata extends AppAgentFeedback {
  metadata: Record<string, any>;
}

// Extended types for Prisma
export interface ProductWithNumbers extends Omit<Product, 'price' | 'earningsSplit'> {
  price: number;
  earningsSplit: number;
}

export interface PurchaseWithProduct extends Omit<Purchase, 'amount'> {
  amount: number;
  product: ProductWithNumbers;
}

// Prisma types
export type ProductCreateInput = Prisma.ProductCreateInput;
export type ProductUpdateInput = Prisma.ProductUpdateInput;
export type ProductWhereInput = Prisma.ProductWhereInput;
export type ProductWhereUniqueInput = Prisma.ProductWhereUniqueInput;
export type ProductOrderByWithRelationInput = Prisma.ProductOrderByWithRelationInput;
export type ProductInclude = Prisma.ProductInclude; 