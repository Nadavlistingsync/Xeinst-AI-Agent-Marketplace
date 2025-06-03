import { z } from 'zod';
import { FeedbackApiResponse } from './feedback';

export interface FeedbackMetrics {
  totalFeedback: number;
  averageRating: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  commonIssues: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  improvementSuggestions: Array<{
    category: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface FeedbackTrend {
  date: string;
  count: number;
  averageRating: number;
  sentimentScore: number;
}

export interface FeedbackCategory {
  name: string;
  count: number;
  percentage: number;
  examples: string[];
}

export interface FeedbackInsights {
  metrics: {
    totalFeedback: number;
    averageRating: number;
    sentimentDistribution: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
  trends: {
    ratingTrend: {
      date: string;
      rating: number;
    }[];
    sentimentTrend: {
      date: string;
      sentiment: number;
    }[];
  };
  categories: {
    name: string;
    count: number;
    averageRating: number;
  }[];
}

export interface FeedbackInsightsResponse {
  success: boolean;
  data?: FeedbackInsights;
  error?: string;
}

export interface FeedbackSummaryApiResponse {
  success: boolean;
  data?: {
    totalFeedback: number;
    averageRating: number;
    recentFeedback: {
      id: string;
      rating: number;
      comment: string | null;
      createdAt: Date;
      user: {
        name: string | null;
        image: string | null;
      };
    }[];
  };
  error?: string;
}

export interface FeedbackTrendsResponse {
  success: true;
  data: FeedbackTrend[];
}

export interface FeedbackCategoriesResponse {
  success: true;
  data: FeedbackCategory[];
}

export type FeedbackAnalyticsResponse =
  | FeedbackApiResponse<FeedbackInsights>
  | FeedbackApiResponse<FeedbackTrend[]>
  | FeedbackApiResponse<FeedbackCategory[]>;

export const feedbackMetricsSchema = z.object({
  totalFeedback: z.number(),
  averageRating: z.number(),
  sentimentDistribution: z.object({
    positive: z.number(),
    neutral: z.number(),
    negative: z.number(),
  }),
  commonIssues: z.array(
    z.object({
      category: z.string(),
      count: z.number(),
      percentage: z.number(),
    })
  ),
  improvementSuggestions: z.array(
    z.object({
      category: z.string(),
      suggestion: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
    })
  ),
});

export const feedbackTrendSchema = z.object({
  date: z.string(),
  count: z.number(),
  averageRating: z.number(),
  sentimentScore: z.number(),
});

export const feedbackCategorySchema = z.object({
  name: z.string(),
  count: z.number(),
  percentage: z.number(),
  examples: z.array(z.string()),
}); 