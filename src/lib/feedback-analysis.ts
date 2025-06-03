import { prisma } from './prisma';
import { ApiError } from './errors';

interface FeedbackAnalysis {
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  categoryDistribution: Record<string, number>;
  trends: {
    rating: number;
    sentiment: number;
    volume: number;
  };
}

export async function analyzeFeedback(agentId: string): Promise<FeedbackAnalysis> {
  try {
    const feedbacks = await prisma.agentFeedback.findMany({
      where: { deploymentId: agentId },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate sentiment distribution
    const sentimentCounts = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    feedbacks.forEach(feedback => {
      const score = feedback.sentimentScore ? Number(feedback.sentimentScore) : 0;
      if (score > 0.5) sentimentCounts.positive++;
      else if (score < -0.5) sentimentCounts.negative++;
      else sentimentCounts.neutral++;
    });

    const totalFeedbacks = feedbacks.length;
    const sentimentDistribution = {
      positive: totalFeedbacks ? sentimentCounts.positive / totalFeedbacks : 0,
      neutral: totalFeedbacks ? sentimentCounts.neutral / totalFeedbacks : 0,
      negative: totalFeedbacks ? sentimentCounts.negative / totalFeedbacks : 0
    };

    // Calculate category distribution
    const categoryCounts: Record<string, number> = {};
    feedbacks.forEach(feedback => {
      if (feedback.categories && typeof feedback.categories === 'object') {
        const categories = feedback.categories as Record<string, number>;
        Object.entries(categories).forEach(([category, value]) => {
          categoryCounts[category] = (categoryCounts[category] || 0) + value;
        });
      }
    });

    const categoryDistribution: Record<string, number> = {};
    Object.entries(categoryCounts).forEach(([category, count]) => {
      categoryDistribution[category] = totalFeedbacks ? count / totalFeedbacks : 0;
    });

    // Calculate trends
    const recentFeedbacks = feedbacks.slice(0, Math.min(10, feedbacks.length));
    const olderFeedbacks = feedbacks.slice(Math.min(10, feedbacks.length));

    const recentAverageRating = recentFeedbacks.reduce((sum, f) => sum + f.rating, 0) / recentFeedbacks.length;
    const olderAverageRating = olderFeedbacks.reduce((sum, f) => sum + f.rating, 0) / olderFeedbacks.length;

    const recentAverageSentiment = recentFeedbacks.reduce((sum, f) => sum + (f.sentimentScore ? Number(f.sentimentScore) : 0), 0) / recentFeedbacks.length;
    const olderAverageSentiment = olderFeedbacks.reduce((sum, f) => sum + (f.sentimentScore ? Number(f.sentimentScore) : 0), 0) / olderFeedbacks.length;

    const trends = {
      rating: recentAverageRating - olderAverageRating,
      sentiment: recentAverageSentiment - olderAverageSentiment,
      volume: recentFeedbacks.length - olderFeedbacks.length
    };

    return {
      sentimentDistribution,
      categoryDistribution,
      trends
    };
  } catch (error) {
    console.error('Error analyzing feedback:', error);
    throw new ApiError('Failed to analyze feedback');
  }
}

export async function getFeedbackTrends(agentId: string, timeRange: 'day' | 'week' | 'month' = 'day') {
  try {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 1));
    }

    const feedbacks = await prisma.agentFeedback.findMany({
      where: {
        deploymentId: agentId,
        createdAt: {
          gte: startDate
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const trends = feedbacks.map(feedback => ({
      date: feedback.createdAt.toISOString(),
      rating: feedback.rating,
      sentiment: feedback.sentimentScore ? Number(feedback.sentimentScore) : 0,
      categories: feedback.categories as Record<string, number> | null
    }));

    return trends;
  } catch (error) {
    console.error('Error getting feedback trends:', error);
    throw new ApiError('Failed to get feedback trends');
  }
}

export async function getFeedbackInsights(agentId: string) {
  try {
    const feedbacks = await prisma.agentFeedback.findMany({
      where: { deploymentId: agentId },
      orderBy: { createdAt: 'desc' }
    });

    const totalFeedbacks = feedbacks.length;
    const averageRating = totalFeedbacks
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
      : 0;

    const sentimentCounts = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    feedbacks.forEach(feedback => {
      const score = feedback.sentimentScore ? Number(feedback.sentimentScore) : 0;
      if (score > 0.5) sentimentCounts.positive++;
      else if (score < -0.5) sentimentCounts.negative++;
      else sentimentCounts.neutral++;
    });

    const sentimentDistribution = {
      positive: totalFeedbacks ? sentimentCounts.positive / totalFeedbacks : 0,
      neutral: totalFeedbacks ? sentimentCounts.neutral / totalFeedbacks : 0,
      negative: totalFeedbacks ? sentimentCounts.negative / totalFeedbacks : 0
    };

    const categoryCounts: Record<string, number> = {};
    feedbacks.forEach(feedback => {
      if (feedback.categories && typeof feedback.categories === 'object') {
        const categories = feedback.categories as Record<string, number>;
        Object.entries(categories).forEach(([category, value]) => {
          categoryCounts[category] = (categoryCounts[category] || 0) + value;
        });
      }
    });

    const categoryDistribution: Record<string, number> = {};
    Object.entries(categoryCounts).forEach(([category, count]) => {
      categoryDistribution[category] = totalFeedbacks ? count / totalFeedbacks : 0;
    });

    return {
      totalFeedbacks,
      averageRating,
      sentimentDistribution,
      categoryDistribution
    };
  } catch (error) {
    console.error('Error getting feedback insights:', error);
    throw new ApiError('Failed to get feedback insights');
  }
} 