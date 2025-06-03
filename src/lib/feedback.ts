import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const feedbackSchema = z.object({
  deploymentId: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().nullable(),
  sentimentScore: z.number().min(-1).max(1).nullable(),
  categories: z.record(z.number()).nullable(),
  metadata: z.record(z.unknown()).nullable()
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

export interface FeedbackOptions {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  deploymentId?: string;
  userId?: string;
  type?: 'error' | 'warning' | 'success';
}

export interface FeedbackFilter {
  where?: {
    createdAt?: {
      gte?: Date;
      lte?: Date;
    };
    deploymentId?: string;
    userId?: string;
    type?: 'error' | 'warning' | 'success';
  };
  take?: number;
  skip?: number;
  orderBy?: {
    [key: string]: 'asc' | 'desc';
  };
}

export type FeedbackUser = {
  name: string | null;
  image: string | null;
};

export type Feedback = {
  id: string;
  deploymentId?: string;
  userId?: string;
  rating?: number;
  comment?: string | null;
  sentimentScore?: number | null;
  categories?: Record<string, number> | null;
  metadata?: Record<string, unknown>;
  response?: string | null;
  responseDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  user?: FeedbackUser;
};

export async function createFeedback(data: FeedbackInput) {
  try {
    const validatedData = feedbackSchema.parse(data);

    const feedback = await prisma.agentFeedback.create({
      data: {
        deploymentId: validatedData.deploymentId,
        rating: validatedData.rating,
        comment: validatedData.comment,
        sentimentScore: validatedData.sentimentScore,
        ...(validatedData.categories !== null && { categories: validatedData.categories }),
      },
    });

    return feedback;
  } catch (error) {
    console.error('Error creating feedback:', error);
    throw error;
  }
}

export async function getFeedbacks(options: FeedbackOptions = {}) {
  try {
    const where: any = {};
    if (options.startDate) where.createdAt = { gte: options.startDate };
    if (options.endDate) where.createdAt = { lte: options.endDate };

    const feedbacks = await prisma.agentFeedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit,
      skip: options.offset
    });

    return feedbacks;
  } catch (error) {
    console.error('Error getting feedbacks:', error);
    throw error;
  }
}

export async function getFeedbackById(id: string) {
  try {
    const feedback = await prisma.agentFeedback.findUnique({
      where: { id }
    });

    return feedback;
  } catch (error) {
    console.error('Error getting feedback by ID:', error);
    throw error;
  }
}

export async function updateFeedback(id: string, data: Partial<FeedbackInput>) {
  try {
    const validatedData = feedbackSchema.partial().parse(data);

    const feedback = await prisma.agentFeedback.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      }
    });

    return feedback;
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw error;
  }
}

export async function deleteFeedback(id: string) {
  try {
    await prisma.agentFeedback.delete({
      where: { id }
    });

    return true;
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw error;
  }
}

export async function getFeedbackByDeployment(deploymentId: string, options: FeedbackOptions = {}) {
  try {
    const where: any = { deploymentId };
    if (options.startDate) where.createdAt = { gte: options.startDate };
    if (options.endDate) where.createdAt = { lte: options.endDate };

    const feedbacks = await prisma.agentFeedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit,
      skip: options.offset
    });

    return feedbacks;
  } catch (error) {
    console.error('Error getting feedback by deployment:', error);
    throw error;
  }
}

export async function getFeedbackByUser(userId: string, options: FeedbackOptions = {}) {
  try {
    const where: any = { userId };
    if (options.startDate) where.createdAt = { gte: options.startDate };
    if (options.endDate) where.createdAt = { lte: options.endDate };

    const feedbacks = await prisma.agentFeedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit,
      skip: options.offset
    });

    return feedbacks;
  } catch (error) {
    console.error('Error getting feedback by user:', error);
    throw error;
  }
}

export async function getFeedbackStats(deploymentId: string) {
  try {
    const feedbacks = await prisma.agentFeedback.findMany({
      where: { deploymentId }
    });

    const stats = {
      total: feedbacks.length,
      averageRating: 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      },
      sentimentDistribution: {
        positive: 0,
        neutral: 0,
        negative: 0
      },
      categoryDistribution: {} as Record<string, number>,
      monthlyTrends: {} as Record<string, { total: number; average: number }>
    };

    if (feedbacks.length > 0) {
      // Calculate average rating
      stats.averageRating = feedbacks.reduce((sum, item) => sum + item.rating, 0) / feedbacks.length;

      // Calculate rating distribution
      feedbacks.forEach((item) => {
        stats.ratingDistribution[item.rating as keyof typeof stats.ratingDistribution]++;
      });

      // Calculate sentiment distribution
      feedbacks.forEach((item) => {
        if (item.sentimentScore) {
          const score = Number(item.sentimentScore);
          if (score > 0.5) {
            stats.sentimentDistribution.positive++;
          } else if (score < -0.5) {
            stats.sentimentDistribution.negative++;
          } else {
            stats.sentimentDistribution.neutral++;
          }
        }
      });

      // Calculate category distribution
      feedbacks.forEach((item) => {
        if (item.categories) {
          const categories = item.categories as Record<string, number>;
          Object.entries(categories).forEach(([category, value]) => {
            stats.categoryDistribution[category] = (stats.categoryDistribution[category] || 0) + value;
          });
        }
      });

      // Calculate monthly trends
      feedbacks.forEach((item) => {
        const month = item.createdAt.toISOString().slice(0, 7);
        if (!stats.monthlyTrends[month]) {
          stats.monthlyTrends[month] = {
            total: 0,
            average: 0
          };
        }
        stats.monthlyTrends[month].total++;
        stats.monthlyTrends[month].average = (stats.monthlyTrends[month].average * (stats.monthlyTrends[month].total - 1) + item.rating) / stats.monthlyTrends[month].total;
      });
    }

    return stats;
  } catch (error) {
    console.error('Error getting feedback stats:', error);
    throw error;
  }
}

export async function getFeedbackInsights(deploymentId: string) {
  try {
    const feedbacks = await prisma.agentFeedback.findMany({
      where: { deploymentId }
    });

    const insights = {
      strengths: [] as string[],
      weaknesses: [] as string[],
      recommendations: [] as string[]
    };

    if (feedbacks.length > 0) {
      const stats = await getFeedbackStats(deploymentId);

      // Analyze strengths
      if (stats.averageRating >= 4) {
        insights.strengths.push('High average rating');
      }
      if (stats.sentimentDistribution.positive > stats.sentimentDistribution.negative) {
        insights.strengths.push('Positive sentiment in feedback');
      }

      // Analyze weaknesses
      if (stats.averageRating < 3) {
        insights.weaknesses.push('Low average rating');
      }
      if (stats.sentimentDistribution.negative > stats.sentimentDistribution.positive) {
        insights.weaknesses.push('Negative sentiment in feedback');
      }

      // Generate recommendations
      if (stats.averageRating < 3) {
        insights.recommendations.push('Improve overall rating');
      }
      if (stats.sentimentDistribution.negative > stats.sentimentDistribution.positive) {
        insights.recommendations.push('Address negative sentiment');
      }
      if (Object.keys(stats.categoryDistribution).length === 0) {
        insights.recommendations.push('Add more category feedback');
      }
    }

    return insights;
  } catch (error) {
    console.error('Error getting feedback insights:', error);
    throw error;
  }
} 