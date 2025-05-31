import { z } from 'zod';
import { Prisma, Decimal } from '@prisma/client';

// Helper function to convert Decimal to number
const decimalToNumber = (value: Decimal | number | null): number => {
  if (value === null) return 0;
  return typeof value === 'number' ? value : Number(value);
};

// Schema definitions
export const userSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  image: z.string().nullable(),
  role: z.string(),
  subscription_tier: z.string(),
  emailVerified: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const deploymentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.string(),
  access_level: z.string(),
  license_type: z.string(),
  environment: z.string(),
  framework: z.string(),
  file_url: z.string().nullable(),
  deployed_by: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  price_cents: z.number(),
  downloads: z.number(),
  rating: z.number().transform(decimalToNumber),
  rating_count: z.number(),
  download_count: z.number(),
  model_type: z.string(),
  requirements: z.string().nullable(),
  api_endpoint: z.string().nullable(),
  version: z.string(),
  source: z.string(),
});

export const agentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  long_description: z.string().nullable(),
  documentation: z.string().nullable(),
  category: z.string(),
  framework: z.string(),
  requirements: z.array(z.string()),
  source: z.string(),
  version: z.string(),
  created_by: z.string(),
  access_level: z.string(),
  license_type: z.string(),
  environment: z.string(),
  file_url: z.string(),
  image_url: z.string().nullable(),
  status: z.string(),
  rating: z.number(),
  download_count: z.number(),
  is_public: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const agentFeedbackSchema = z.object({
  id: z.string(),
  agent_id: z.string(),
  user_id: z.string(),
  rating: z.number(),
  comment: z.string().nullable(),
  sentiment_score: z.number().nullable().transform(decimalToNumber),
  categories: z.record(z.any()).nullable(),
  creator_response: z.string().nullable(),
  response_date: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
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
  agent_id: z.string(),
  total_requests: z.number(),
  average_response_time: z.number(),
  error_rate: z.number(),
  success_rate: z.number(),
  active_users: z.number(),
  requests_per_minute: z.number(),
  average_tokens_used: z.number(),
  cost_per_request: z.number(),
  total_cost: z.number(),
  last_updated: z.date(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  long_description: z.string().nullable(),
  category: z.string(),
  price: z.number().transform(decimalToNumber),
  image_url: z.string().nullable(),
  file_url: z.string(),
  documentation: z.string().nullable(),
  features: z.array(z.string()),
  requirements: z.array(z.string()),
  rating: z.number(),
  average_rating: z.number().transform(decimalToNumber),
  total_ratings: z.number(),
  created_by: z.string(),
  uploaded_by: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  is_public: z.boolean(),
  is_featured: z.boolean(),
  download_count: z.number(),
  earnings_split: z.number().transform(decimalToNumber),
});

export const reviewSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  product_id: z.string(),
  rating: z.number(),
  comment: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const purchaseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  product_id: z.string(),
  amount: z.number().transform(decimalToNumber),
  status: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const earningSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  product_id: z.string(),
  amount: z.number().transform(decimalToNumber),
  status: z.string(),
  stripe_transfer_id: z.string().nullable(),
  paid_at: z.date().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

// Type exports
export type User = Prisma.UserGetPayload<{}>;
export type Deployment = Prisma.DeploymentGetPayload<{}>;
export type Agent = z.infer<typeof agentSchema>;
export type AgentFeedback = Prisma.AgentFeedbackGetPayload<{}>;
export type AgentLog = Prisma.AgentLogGetPayload<{}>;
export type AgentMetrics = Prisma.AgentMetricsGetPayload<{}>;
export type Product = Prisma.ProductGetPayload<{}>;
export type Review = Prisma.ReviewGetPayload<{}>;
export type Purchase = Prisma.PurchaseGetPayload<{}>;
export type Earning = Prisma.EarningGetPayload<{}>;
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
  sentiment_score: number;
  positive_feedback: number;
  negative_feedback: number;
  total_feedbacks: number;
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

export type Notification = Prisma.NotificationGetPayload<{}>;

export type Order = {
  id: string;
  user_id: string;
  product_id: string;
  amount: number;
  status: string;
  created_at: Date;
  updated_at: Date;
};

export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

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

export interface FilterParams {
  userId?: string;
  productId?: string;
  agentId?: string;
  status?: string;
  type?: string;
  level?: string;
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