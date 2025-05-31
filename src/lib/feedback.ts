import { Prisma } from '@prisma/client';
import prismaClient from './db';
import { Feedback } from './schema';

export interface CreateFeedbackInput {
  agent_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  sentiment_score?: number;
  categories?: Record<string, any>;
  creator_response?: string;
}

export async function createFeedback(data: CreateFeedbackInput): Promise<Feedback> {
  try {
    return await prismaClient.feedback.create({
      data: {
        agentId: data.agent_id,
        userId: data.user_id,
        rating: data.rating,
        comment: data.comment,
        sentimentScore: data.sentiment_score ? new Prisma.Decimal(data.sentiment_score) : null,
        categories: data.categories || {},
        creatorResponse: data.creator_response,
        responseDate: data.creator_response ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    throw new Error('Failed to create feedback');
  }
}

export async function updateFeedback(
  id: string,
  data: {
    rating?: number;
    comment?: string;
    sentiment_score?: number;
    categories?: Record<string, any>;
    creator_response?: string;
  }
): Promise<Feedback> {
  try {
    const updateData: any = { ...data };
    if (data.sentiment_score !== undefined) {
      updateData.sentimentScore = new Prisma.Decimal(data.sentiment_score);
    }
    if (data.creator_response) {
      updateData.responseDate = new Date();
    }
    updateData.updatedAt = new Date();

    return await prismaClient.feedback.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw new Error('Failed to update feedback');
  }
}

export async function getFeedbacks(options: {
  user_id?: string;
  product_id?: string;
  rating?: number;
  start_date?: Date;
  end_date?: Date;
} = {}): Promise<Feedback[]> {
  try {
    const where: Prisma.FeedbackWhereInput = {};
    
    if (options.user_id) where.user_id = options.user_id;
    if (options.product_id) where.product_id = options.product_id;
    if (options.rating) where.rating = options.rating;
    if (options.start_date) where.created_at = { gte: options.start_date };
    if (options.end_date) where.created_at = { lte: options.end_date };

    return await prismaClient.feedback.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  } catch (error) {
    console.error('Error getting feedbacks:', error);
    throw new Error('Failed to get feedbacks');
  }
}

export async function getFeedback(id: string): Promise<Feedback | null> {
  try {
    return await prismaClient.feedback.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error getting feedback:', error);
    throw new Error('Failed to get feedback');
  }
}

export async function deleteFeedback(id: string): Promise<void> {
  try {
    await prismaClient.feedback.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw new Error('Failed to delete feedback');
  }
}

export async function getFeedbackStats(productId: string) {
  try {
    const feedbacks = await getFeedbacks({ product_id: productId });

    const totalRatings = feedbacks.length;
    const averageRating = totalRatings > 0
      ? feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / totalRatings
      : 0;

    const ratingDistribution = feedbacks.reduce((acc, feedback) => {
      acc[feedback.rating] = (acc[feedback.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const recentFeedbacks = feedbacks.slice(0, 5);

    return {
      totalRatings,
      averageRating,
      ratingDistribution,
      recentFeedbacks,
    };
  } catch (error) {
    console.error('Error getting feedback stats:', error);
    throw new Error('Failed to get feedback stats');
  }
}

export async function getFeedbackHistory(productId: string) {
  try {
    const feedbacks = await getFeedbacks({ product_id: productId });

    const monthlyRatings = feedbacks.reduce((acc, feedback) => {
      const month = feedback.created_at.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { total: 0, count: 0 };
      }
      acc[month].total += feedback.rating;
      acc[month].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    // Calculate average rating for each month
    const monthlyAverages = Object.entries(monthlyRatings).reduce((acc, [month, data]) => {
      acc[month] = data.total / data.count;
      return acc;
    }, {} as Record<string, number>);

    return {
      monthlyAverages,
      recentFeedbacks: feedbacks.slice(0, 10),
    };
  } catch (error) {
    console.error('Error getting feedback history:', error);
    throw new Error('Failed to get feedback history');
  }
} 