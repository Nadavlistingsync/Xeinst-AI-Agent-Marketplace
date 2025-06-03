import { z } from 'zod';
import { JsonValue } from '@prisma/client/runtime/library';

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface Deployment {
  id: string;
  name: string;
  description: string | null;
  createdBy: string;
}

export interface Feedback {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  rating: number;
  deploymentId: string;
  comment: string | null;
  sentimentScore: number;
  categories: Record<string, any> | null;
  creatorResponse: string | null;
  responseDate: Date | null;
  metadata?: JsonValue;
  user: User;
  deployment: Deployment;
}

export interface FeedbackResponse {
  success: boolean;
  data?: Feedback;
  error?: string;
}

export interface FeedbackSuccess {
  success: true;
  data: Feedback;
}

export interface FeedbackError {
  success: false;
  error: string;
  message: string;
  details?: ValidationError[];
  status: number;
}

export type FeedbackResponseInput = z.infer<typeof feedbackResponseSchema>;

export interface ValidationError {
  path: string;
  message: string;
}

export interface FeedbackSummary {
  totalFeedbacks: number;
  averageRating: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  categoryDistribution: Record<string, number>;
  recentActivity: {
    lastFeedbackDate: string;
    responseRate: number;
    averageResponseTime: number;
  };
}

export interface FeedbackTrend {
  date: string;
  count: number;
  averageRating: number;
  sentiment: number;
  categories: Record<string, number> | null;
}

export interface FeedbackAnalytics {
  averageRating: number;
  totalFeedback: number;
  sentimentDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface FeedbackInsights {
  metrics: {
    averageRating: number;
    totalFeedbacks: number;
    sentimentDistribution: Record<string, number>;
  };
  trends: {
    ratingTrend: Array<{ date: string; rating: number }>;
    sentimentTrend: Array<{ date: string; score: number }>;
  };
  categories: Record<string, number>;
}

export interface FeedbackInsightsResponse {
  success: boolean;
  data?: FeedbackInsights;
  error?: string;
}

export interface FeedbackRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  impact: number;
  effort: number;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackSearchResult {
  results: Feedback[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FeedbackExport {
  id: string;
  rating: number;
  comment: string | null;
  sentimentScore: number | null;
  categories: Record<string, number> | null;
  response: string | null;
  responseDate: Date | null;
  userName: string | null;
  userEmail: string | null;
}

export interface AgentFeedback {
  id: string;
  deploymentId: string;
  userId: string;
  rating: number;
  comment: string | null;
  sentimentScore: number;
  categories: Record<string, number> | null;
  creatorResponse: string | null;
  responseDate: Date | null;
  metadata: JsonValue;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackMetrics {
  averageRating: number;
  totalFeedback: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  categoryDistribution: Record<string, number>;
  responseRate: number;
  averageSentiment: number;
  trends: {
    rating: number;
    sentiment: number;
    volume: number;
  };
  days: number;
}

export const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().nullable(),
  categories: z.record(z.number()).nullable(),
  metadata: z.record(z.unknown()).nullable()
});

export const feedbackResponseSchema = z.object({
  response: z.string().min(1)
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

export interface CreateFeedbackInput {
  rating: number;
  comment?: string;
  categories?: Record<string, number>;
  metadata?: JsonValue;
}

export interface UpdateFeedbackInput {
  rating?: number;
  comment?: string;
  categories?: Record<string, number>;
  metadata?: JsonValue;
  creatorResponse?: string;
} 