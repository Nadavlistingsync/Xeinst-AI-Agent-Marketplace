import { z } from 'zod';

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