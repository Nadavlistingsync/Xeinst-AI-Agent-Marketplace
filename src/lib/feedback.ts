import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const prismaClient = new PrismaClient();

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  sentimentScore: z.number().optional(),
  categories: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

export type CreateFeedbackInput = z.infer<typeof feedbackSchema> & {
  deploymentId: string;
  userId: string;
};

export type UpdateFeedbackInput = Partial<z.infer<typeof feedbackSchema>>;

export async function createFeedback(data: z.infer<typeof feedbackSchema> & { deploymentId: string; userId: string }) {
  const validatedFeedback = feedbackSchema.parse(data);
  
  return prismaClient.agentFeedback.create({
    data: {
      rating: validatedFeedback.rating,
      comment: validatedFeedback.comment,
      sentimentScore: validatedFeedback.sentimentScore ?? 0,
      categories: validatedFeedback.categories ? validatedFeedback.categories as Prisma.InputJsonValue : Prisma.JsonNull,
      metadata: validatedFeedback.metadata ? validatedFeedback.metadata as Prisma.InputJsonValue : Prisma.JsonNull,
      deployment: {
        connect: { id: data.deploymentId }
      },
      user: {
        connect: { id: data.userId }
      }
    }
  });
}

export async function updateFeedback(id: string, data: Partial<z.infer<typeof feedbackSchema>>) {
  const validatedFeedback = feedbackSchema.partial().parse(data);
  
  return prismaClient.agentFeedback.update({
    where: { id },
    data: {
      ...validatedFeedback,
      categories: validatedFeedback.categories ? validatedFeedback.categories as Prisma.InputJsonValue : undefined,
      metadata: validatedFeedback.metadata ? validatedFeedback.metadata as Prisma.InputJsonValue : undefined,
    }
  });
}

export async function getFeedback(id: string) {
  return prismaClient.agentFeedback.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      deployment: true,
    },
  });
}

export async function getFeedbacks(options: {
  deploymentId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
} = {}) {
  const where: Prisma.AgentFeedbackWhereInput = {};

  if (options.deploymentId) where.deploymentId = options.deploymentId;
  if (options.userId) where.userId = options.userId;
  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return prismaClient.agentFeedback.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      deployment: true,
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
}

export async function deleteFeedback(id: string) {
  return prismaClient.agentFeedback.delete({
    where: { id },
  });
}

export async function getFeedbackStats(deploymentId: string) {
  const feedbacks = await getFeedbacks({ deploymentId });

  const stats = {
    total: feedbacks.length,
    averageRating: feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length,
    ratingDistribution: feedbacks.reduce((acc, f) => {
      acc[f.rating] = (acc[f.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>),
    sentimentDistribution: feedbacks.reduce((acc, f) => {
      const sentiment = f.sentimentScore ?? 0;
      const category = sentiment > 0.3 ? 'positive' : sentiment < -0.3 ? 'negative' : 'neutral';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return stats;
}

export async function getFeedbackHistory(deploymentId: string) {
  const feedbacks = await getFeedbacks({ deploymentId });

  const monthlyFeedback = feedbacks.reduce((acc, feedback) => {
    const month = feedback.createdAt.toISOString().slice(0, 7);
    if (!acc[month]) {
      acc[month] = {
        total: 0,
        averageRating: 0,
        sentimentScore: 0,
      };
    }
    acc[month].total += 1;
    acc[month].averageRating = (acc[month].averageRating * (acc[month].total - 1) + feedback.rating) / acc[month].total;
    acc[month].sentimentScore = (acc[month].sentimentScore * (acc[month].total - 1) + (feedback.sentimentScore ?? 0)) / acc[month].total;
    return acc;
  }, {} as Record<string, { total: number; averageRating: number; sentimentScore: number }>);

  return {
    monthlyFeedback,
    recentFeedback: feedbacks.slice(0, 10),
  };
} 