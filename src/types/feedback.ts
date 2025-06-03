import { z } from 'zod';
import { User } from '../lib/schema';

export const feedbackSchema = z.object({
  type: z.enum(['error', 'warning', 'success']),
  message: z.string().min(1).max(1000),
  agentId: z.string().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

export interface FeedbackResponse {
  success: boolean;
  feedback?: {
    id: string;
    agentId: string;
    userId: string;
    rating: number;
    comment: string;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
  };
  error?: string;
  details?: z.ZodError[];
}

export interface FeedbackError {
  success: false;
  error: string;
  details?: z.ZodError[];
}

export interface FeedbackSuccess {
  success: true;
  feedback: {
    id: string;
    agentId: string;
    userId: string;
    rating: number;
    comment: string;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
  };
}

export type FeedbackApiResponse = FeedbackSuccess | FeedbackError;

export interface Feedback {
  id: string;
  rating: number;
  comment: string | null;
  sentimentScore: number | null;
  categories: Record<string, number> | null;
  createdAt: Date;
  updatedAt: Date;
  response: string | null;
  responseDate: Date | null;
  user: User;
  agentId: string;
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
    lastFeedbackDate: Date | null;
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
  overview: {
    totalFeedbacks: number;
    averageRating: number;
    responseRate: number;
    averageResponseTime: number;
  };
  sentiment: {
    distribution: {
      positive: number;
      neutral: number;
      negative: number;
    };
    trends: {
      date: string;
      score: number;
    }[];
  };
  categories: {
    distribution: Record<string, number>;
    trends: {
      date: string;
      categories: Record<string, number>;
    }[];
  };
  ratings: {
    distribution: Record<number, number>;
    trends: {
      date: string;
      rating: number;
    }[];
  };
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
  createdAt: Date;
  response: string | null;
  responseDate: Date | null;
  userName: string | null;
  userEmail: string | null;
} 