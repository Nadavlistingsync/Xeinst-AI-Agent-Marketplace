import { z } from 'zod';

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
  deploymentId: string;
  userId: string;
  rating: number;
  comment: string | null;
  sentimentScore: number | null;
  categories: Record<string, number> | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  creatorResponse: string | null;
  responseDate: Date | null;
  user: User;
  deployment: Deployment;
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

export type FeedbackResponse = FeedbackSuccess | FeedbackError;

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
  sentimentTrend: {
    positive: number;
    neutral: number;
    negative: number;
  };
  categoryTrends: Record<string, number>;
  commonIssues: string[];
  recommendations: string[];
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

export interface FeedbackMetrics {
  averageRating: number;
  totalFeedbacks: number;
  positiveFeedbacks: number;
  negativeFeedbacks: number;
  neutralFeedbacks: number;
  sentimentScore: number;
  commonIssues: string[];
  improvementSuggestions: string[];
  categories: Record<string, number>;
  responseMetrics: {
    totalResponses: number;
    averageResponseTime: number;
    responseRate: number;
  };
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
export type FeedbackResponseInput = z.infer<typeof feedbackResponseSchema>; 