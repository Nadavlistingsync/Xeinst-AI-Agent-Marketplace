import { z } from 'zod';
import { type Feedback } from './feedback';

export const feedbackInsightsSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day'),
  filters: z.object({
    agentId: z.string().optional(),
    userId: z.string().optional(),
    type: z.enum(['error', 'warning', 'success']).optional(),
  }).optional(),
});

export const feedbackTrendsSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  metrics: z.array(z.enum([
    'rating',
    'sentiment',
    'response_time',
    'volume',
    'satisfaction'
  ])),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day'),
});

export const feedbackCategoriesSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  minCount: z.number().int().min(1).optional().default(5),
  limit: z.number().int().min(1).max(100).optional().default(10),
});

export interface FeedbackInsight {
  date: Date;
  count: number;
  averageRating: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  categories: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

export interface FeedbackTrend {
  date: string;
  count: number;
  averageRating: number;
  sentiment: number;
  categories: Record<string, number> | null;
}

export interface FeedbackCategory {
  name: string;
  count: number;
  percentage: number;
  examples: Feedback[];
}

export interface FeedbackInsightsResponse {
  success: boolean;
  data?: {
    insights: FeedbackInsight[];
    summary: {
      total: number;
      averageRating: number;
      sentiment: {
        positive: number;
        neutral: number;
        negative: number;
      };
    };
  };
  error?: string;
}

export interface FeedbackTrendsResponse {
  success: boolean;
  data?: {
    trends: FeedbackTrend[];
    summary: Record<string, {
      average: number;
      min: number;
      max: number;
      change: number;
    }>;
  };
  error?: string;
}

export interface FeedbackCategoriesResponse {
  success: boolean;
  data?: {
    categories: FeedbackCategory[];
    summary: {
      total: number;
      uniqueCategories: number;
    };
  };
  error?: string;
}

export interface FeedbackAnalyticsError {
  success: false;
  error: string;
}

export interface FeedbackAnalyticsSuccess<T> {
  success: true;
  data: T;
}

export type FeedbackAnalyticsApiResponse<T> = 
  | FeedbackAnalyticsSuccess<T>
  | FeedbackAnalyticsError;

export type FeedbackInsightsApiResponse = 
  | FeedbackAnalyticsSuccess<FeedbackInsightsResponse['data']>
  | FeedbackAnalyticsError;

export type FeedbackTrendsApiResponse = 
  | FeedbackAnalyticsSuccess<FeedbackTrendsResponse['data']>
  | FeedbackAnalyticsError;

export type FeedbackCategoriesApiResponse = 
  | FeedbackAnalyticsSuccess<FeedbackCategoriesResponse['data']>
  | FeedbackAnalyticsError;

export type FeedbackInsightsInput = z.infer<typeof feedbackInsightsSchema>;
export type FeedbackTrendsInput = z.infer<typeof feedbackTrendsSchema>;
export type FeedbackCategoriesInput = z.infer<typeof feedbackCategoriesSchema>; 