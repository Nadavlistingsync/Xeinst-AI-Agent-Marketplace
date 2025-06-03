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
  sentimentScore: number;
  categories: Record<string, number> | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  creatorResponse: string | null;
  responseDate: Date | null;
  user: User;
  deployment: Deployment;
}

export interface FeedbackSuccess<T = Feedback> {
  success: true;
  data: T;
}

export interface FeedbackError {
  success: false;
  error: string;
  details?: z.ZodError[];
}

export type FeedbackApiResponse<T = Feedback> = FeedbackSuccess<T> | FeedbackError;

export const feedbackSchema = z.object({
  deploymentId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  categories: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

export interface FeedbackResponse {
  success: boolean;
  feedback?: Feedback;
  error?: string;
  details?: z.ZodError[];
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