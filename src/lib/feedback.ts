import { prisma } from '../types/prisma';
import type { AgentFeedback } from '@prisma/client';
import { z } from 'zod';

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  deploymentId: z.string(),
  userId: z.string(),
  sentimentScore: z.number().optional(),
  categories: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional()
});

type CreateFeedbackInput = z.infer<typeof feedbackSchema>;
type UpdateFeedbackInput = Partial<CreateFeedbackInput>;

export async function createFeedback(data: CreateFeedbackInput): Promise<AgentFeedback> {
  const validatedData = feedbackSchema.parse(data);
  return prisma.agentFeedback.create({
    data: validatedData as any
  });
}

export async function updateFeedback(id: string, data: UpdateFeedbackInput): Promise<AgentFeedback> {
  return prisma.agentFeedback.update({
    where: { id },
    data
  });
}

export async function getFeedback(id: string): Promise<AgentFeedback | null> {
  return prisma.agentFeedback.findUnique({
    where: { id }
  });
}

export async function getFeedbacks(deploymentId: string): Promise<AgentFeedback[]> {
  return prisma.agentFeedback.findMany({
    where: { deploymentId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function deleteFeedback(id: string): Promise<AgentFeedback> {
  return prisma.agentFeedback.delete({
    where: { id }
  });
}

export async function getFeedbackStats(deploymentId: string) {
  const data = await prisma.agentFeedback.aggregate({
    where: { deploymentId },
    _count: true,
    _avg: {
      rating: true,
      sentimentScore: true
    }
  });

  return {
    count: data._count,
    averageRating: data._avg.rating || 0,
    averageSentiment: data._avg.sentimentScore || 0
  };
}

export async function getFeedbackHistory(deploymentId: string) {
  const feedback = await prisma.agentFeedback.findMany({
    where: { deploymentId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  return feedback.map(f => ({
    ...f,
    user: {
      name: f.user.name || 'Anonymous',
      email: f.user.email
    }
  }));
}

export async function getFeedbackSummary(deploymentId: string) {
  const feedback = await prisma.agentFeedback.findMany({
    where: { deploymentId },
    orderBy: { createdAt: 'desc' }
  });

  const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
  const count = feedback.length;

  return {
    totalRating,
    count,
    averageRating: count > 0 ? totalRating / count : 0,
    sentimentDistribution: feedback.reduce((acc, f) => {
      const score = f.sentimentScore || 0;
      const category = score < 0.3 ? 'negative' : score < 0.7 ? 'neutral' : 'positive';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
} 