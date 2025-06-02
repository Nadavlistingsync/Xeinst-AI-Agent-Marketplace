import { prisma } from './db';
import { Prisma } from '@prisma/client';
import { Feedback } from './schema';

export interface CreateFeedbackInput {
  agentId: string;
  user_id: string;
  rating: number;
  comment?: string;
  categories?: string[];
}

export interface UpdateFeedbackInput {
  rating?: number;
  comment?: string;
  categories?: string[];
  creatorResponse?: string;
}

export interface FeedbackOptions {
  startDate?: Date;
  endDate?: Date;
  rating?: number;
  hasResponse?: boolean;
}

export async function createFeedback(data: CreateFeedbackInput): Promise<Feedback> {
  try {
    return await prisma.agentFeedback.create({
      data: {
        ...data,
        created_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    throw new Error('Failed to create feedback');
  }
}

export async function updateFeedback(id: string, data: UpdateFeedbackInput): Promise<Feedback> {
  try {
    return await prisma.agentFeedback.update({
      where: { id },
      data: {
        ...data,
        responseDate: data.creatorResponse ? new Date() : undefined,
      },
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw new Error('Failed to update feedback');
  }
}

export async function getFeedbacks(options: FeedbackOptions = {}): Promise<Feedback[]> {
  try {
    const where: Prisma.AgentFeedbackWhereInput = {};
    
    if (options.startDate) where.created_at = { gte: options.startDate };
    if (options.endDate) where.created_at = { lte: options.endDate };
    if (options.rating) where.rating = options.rating;
    if (options.hasResponse !== undefined) {
      where.creatorResponse = options.hasResponse ? { not: null } : null;
    }

    return await prisma.agentFeedback.findMany({
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
    return await prisma.agentFeedback.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error getting feedback:', error);
    throw new Error('Failed to get feedback');
  }
}

export async function deleteFeedback(id: string): Promise<void> {
  try {
    await prisma.agentFeedback.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw new Error('Failed to delete feedback');
  }
}

export async function getFeedbackStats(agentId: string) {
  try {
    const feedbacks = await getFeedbacks({ agentId });

    const total_ratings = feedbacks.length;
    const average_rating = total_ratings > 0
      ? feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / total_ratings
      : 0;

    const ratingDistribution = feedbacks.reduce((acc, feedback) => {
      acc[feedback.rating] = (acc[feedback.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const recentFeedbacks = feedbacks.slice(0, 5);

    const categoryDistribution: Record<string, number> = {};
    feedbacks.forEach((f) => {
      if (f.categories) {
        const categories = Array.isArray(f.categories) ? f.categories : [f.categories];
        categories.forEach((category) => {
          categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
        });
      }
    });

    const responseRate = feedbacks.filter((f) => f.creatorResponse).length / total_ratings || 0;
    const averageResponseTime = feedbacks.reduce((sum, f) => {
      if (f.creatorResponse && f.responseDate) {
        return sum + (f.responseDate.getTime() - f.created_at.getTime());
      }
      return sum;
    }, 0) / feedbacks.filter((f) => f.creatorResponse && f.responseDate).length || 0;

    return {
      total_ratings,
      average_rating,
      ratingDistribution,
      recentFeedbacks,
      categoryDistribution,
      responseRate,
      averageResponseTime,
    };
  } catch (error) {
    console.error('Error getting feedback stats:', error);
    throw new Error('Failed to get feedback stats');
  }
}

export async function getFeedbackHistory(agentId: string) {
  try {
    const feedbacks = await getFeedbacks({ agentId });

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

export async function getFeedbackTrends(agentId: string, timeRange: { start: Date; end: Date }) {
  try {
    const feedbacks = await getFeedbacks({
      agentId,
      startDate: timeRange.start,
      endDate: timeRange.end,
    });

    const monthlyStats: Record<string, { total: number; count: number }> = {};

    feedbacks.forEach((feedback) => {
      const month = feedback.created_at.toISOString().slice(0, 7);
      if (!monthlyStats[month]) {
        monthlyStats[month] = { total: 0, count: 0 };
      }
      monthlyStats[month].total += feedback.rating;
      monthlyStats[month].count += 1;
    });

    const trends = Object.entries(monthlyStats).reduce((acc, [month, data]) => {
      acc[month] = data.total / data.count;
      return acc;
    }, {} as Record<string, number>);

    return trends;
  } catch (error) {
    console.error('Error getting feedback trends:', error);
    throw new Error('Failed to get feedback trends');
  }
}

export async function getFeedbackCategories(agentId: string) {
  try {
    const feedbacks = await getFeedbacks({ agentId });

    const categories = new Set<string>();
    feedbacks.forEach((f) => {
      if (f.categories) {
        const cats = Array.isArray(f.categories) ? f.categories : [f.categories];
        cats.forEach((cat) => categories.add(cat));
      }
    });

    return Array.from(categories);
  } catch (error) {
    console.error('Error getting feedback categories:', error);
    throw new Error('Failed to get feedback categories');
  }
}

export async function getFeedbackResponses(agentId: string) {
  try {
    return await getFeedbacks({
      agentId,
      hasResponse: true,
    });
  } catch (error) {
    console.error('Error getting feedback responses:', error);
    throw new Error('Failed to get feedback responses');
  }
}

export async function getFeedbackWithoutResponse(agentId: string) {
  try {
    return await getFeedbacks({
      agentId,
      hasResponse: false,
    });
  } catch (error) {
    console.error('Error getting feedback without response:', error);
    throw new Error('Failed to get feedback without response');
  }
}

export async function getFeedbackByRating(agentId: string, rating: number) {
  try {
    return await getFeedbacks({
      agentId,
      rating,
    });
  } catch (error) {
    console.error('Error getting feedback by rating:', error);
    throw new Error('Failed to get feedback by rating');
  }
}

export async function getFeedbackByCategory(agentId: string, category: string) {
  try {
    return await getFeedbacks({
      agentId,
      categories: [category],
    });
  } catch (error) {
    console.error('Error getting feedback by category:', error);
    throw new Error('Failed to get feedback by category');
  }
}

export async function getFeedbackByDateRange(agentId: string, startDate: Date, endDate: Date) {
  try {
    return await getFeedbacks({
      agentId,
      startDate,
      endDate,
    });
  } catch (error) {
    console.error('Error getting feedback by date range:', error);
    throw new Error('Failed to get feedback by date range');
  }
}

export async function getFeedbackByUser(agentId: string, user_id: string) {
  try {
    return await getFeedbacks({
      agentId,
      user_id,
    });
  } catch (error) {
    console.error('Error getting feedback by user:', error);
    throw new Error('Failed to get feedback by user');
  }
}

export async function getFeedbackByResponseTime(agentId: string, maxResponseTime: number) {
  try {
    const feedbacks = await getFeedbacks({
      agentId,
      hasResponse: true,
    });

    return feedbacks.filter((f) => {
      if (!f.responseDate) return false;
      const responseTime = f.responseDate.getTime() - f.created_at.getTime();
      return responseTime <= maxResponseTime;
    });
  } catch (error) {
    console.error('Error getting feedback by response time:', error);
    throw new Error('Failed to get feedback by response time');
  }
}

export async function getFeedbackBySentiment(agentId: string, sentimentThreshold: number) {
  try {
    return await getFeedbacks({
      agentId,
      sentimentScore: {
        gte: sentimentThreshold,
      },
    });
  } catch (error) {
    console.error('Error getting feedback by sentiment:', error);
    throw new Error('Failed to get feedback by sentiment');
  }
}

export async function getFeedbackByResponseStatus(agentId: string, hasResponse: boolean) {
  try {
    return await getFeedbacks({
      agentId,
      creatorResponse: hasResponse ? { not: null } : null,
    });
  } catch (error) {
    console.error('Error getting feedback by response status:', error);
    throw new Error('Failed to get feedback by response status');
  }
}

export async function getFeedbackByRatingRange(agentId: string, minRating: number, maxRating: number) {
  try {
    return await getFeedbacks({
      agentId,
      rating: {
        gte: minRating,
        lte: maxRating,
      },
    });
  } catch (error) {
    console.error('Error getting feedback by rating range:', error);
    throw new Error('Failed to get feedback by rating range');
  }
}

export async function getFeedbackByCategoryCount(agentId: string, minCategories: number) {
  try {
    const feedbacks = await getFeedbacks({ agentId });

    return feedbacks.filter((f) => {
      if (!f.categories) return false;
      const categories = Array.isArray(f.categories) ? f.categories : [f.categories];
      return categories.length >= minCategories;
    });
  } catch (error) {
    console.error('Error getting feedback by category count:', error);
    throw new Error('Failed to get feedback by category count');
  }
}

export async function getFeedbackByResponseTimeRange(agentId: string, minTime: number, maxTime: number) {
  try {
    const feedbacks = await getFeedbacks({
      agentId,
      hasResponse: true,
    });

    return feedbacks.filter((f) => {
      if (!f.responseDate) return false;
      const responseTime = f.responseDate.getTime() - f.created_at.getTime();
      return responseTime >= minTime && responseTime <= maxTime;
    });
  } catch (error) {
    console.error('Error getting feedback by response time range:', error);
    throw new Error('Failed to get feedback by response time range');
  }
}

export async function getFeedbackBySentimentRange(agentId: string, minSentiment: number, maxSentiment: number) {
  try {
    return await getFeedbacks({
      agentId,
      sentimentScore: {
        gte: minSentiment,
        lte: maxSentiment,
      },
    });
  } catch (error) {
    console.error('Error getting feedback by sentiment range:', error);
    throw new Error('Failed to get feedback by sentiment range');
  }
}

export async function getFeedbackByCategoryCombination(agentId: string, categories: string[]) {
  try {
    return await getFeedbacks({
      agentId,
      categories: {
        hasEvery: categories,
      },
    });
  } catch (error) {
    console.error('Error getting feedback by category combination:', error);
    throw new Error('Failed to get feedback by category combination');
  }
}

export async function getFeedbackByRatingDistribution(agentId: string) {
  try {
    const feedbacks = await getFeedbacks({ agentId });

    const distribution: Record<number, number> = {};
    feedbacks.forEach((f) => {
      distribution[f.rating] = (distribution[f.rating] || 0) + 1;
    });

    return distribution;
  } catch (error) {
    console.error('Error getting feedback by rating distribution:', error);
    throw new Error('Failed to get feedback by rating distribution');
  }
}

export async function getFeedbackByCategoryDistribution(agentId: string) {
  try {
    const feedbacks = await getFeedbacks({ agentId });

    const distribution: Record<string, number> = {};
    feedbacks.forEach((f) => {
      if (f.categories) {
        const categories = Array.isArray(f.categories) ? f.categories : [f.categories];
        categories.forEach((category) => {
          distribution[category] = (distribution[category] || 0) + 1;
        });
      }
    });

    return distribution;
  } catch (error) {
    console.error('Error getting feedback by category distribution:', error);
    throw new Error('Failed to get feedback by category distribution');
  }
}

export async function getFeedbackByResponseTimeDistribution(agentId: string) {
  try {
    const feedbacks = await getFeedbacks({
      agentId,
      hasResponse: true,
    });

    const distribution: Record<string, number> = {};
    feedbacks.forEach((f) => {
      if (!f.responseDate) return;
      const responseTime = f.responseDate.getTime() - f.created_at.getTime();
      const timeRange = Math.floor(responseTime / (24 * 60 * 60 * 1000)); // Convert to days
      distribution[`${timeRange} days`] = (distribution[`${timeRange} days`] || 0) + 1;
    });

    return distribution;
  } catch (error) {
    console.error('Error getting feedback by response time distribution:', error);
    throw new Error('Failed to get feedback by response time distribution');
  }
}

export async function getFeedbackBySentimentDistribution(agentId: string) {
  try {
    const feedbacks = await getFeedbacks({
      agentId,
      sentimentScore: { not: null },
    });

    const distribution: Record<string, number> = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    feedbacks.forEach((f) => {
      if (!f.sentimentScore) return;
      const score = Number(f.sentimentScore);
      if (score > 0.5) distribution.positive++;
      else if (score < -0.5) distribution.negative++;
      else distribution.neutral++;
    });

    return distribution;
  } catch (error) {
    console.error('Error getting feedback by sentiment distribution:', error);
    throw new Error('Failed to get feedback by sentiment distribution');
  }
}

export async function getFeedbackByResponseStatusDistribution(agentId: string) {
  try {
    const feedbacks = await getFeedbacks({ agentId });

    const distribution = {
      responded: 0,
      notResponded: 0,
    };

    feedbacks.forEach((f) => {
      if (f.creatorResponse) distribution.responded++;
      else distribution.notResponded++;
    });

    return distribution;
  } catch (error) {
    console.error('Error getting feedback by response status distribution:', error);
    throw new Error('Failed to get feedback by response status distribution');
  }
} 