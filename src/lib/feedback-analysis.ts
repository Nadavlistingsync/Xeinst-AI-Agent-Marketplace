import type { AgentFeedback } from '../types/prisma';
import { prisma } from './db';
import { ApiError } from './errors';

interface FeedbackAnalysis {
  totalFeedbacks: number;
  averageRating: number;
  sentimentDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  recentTrends: {
    averageRating: number;
    sentimentScore: number;
  };
  monthlyData: Array<{
    month: string;
    count: number;
    averageRating: number;
    averageSentiment: number;
  }>;
}

export async function analyzeFeedback(deploymentId: string): Promise<FeedbackAnalysis> {
  const feedbacks = await prisma.agentFeedback.findMany({
    where: { deploymentId },
    orderBy: { createdAt: 'desc' },
  });

  const sentimentDistribution: Record<string, number> = {};
  const categoryDistribution: Record<string, number> = {};

  feedbacks.forEach((feedback: AgentFeedback) => {
    if (feedback.sentimentScore !== null) {
      const sentiment = feedback.sentimentScore > 0.5 ? 'positive' : feedback.sentimentScore < -0.5 ? 'negative' : 'neutral';
      sentimentDistribution[sentiment] = (sentimentDistribution[sentiment] || 0) + 1;
    }

    if (feedback.categories) {
      const categories = feedback.categories as Record<string, boolean>;
      Object.keys(categories).forEach(category => {
        if (categories[category]) {
          categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
        }
      });
    }
  });

  const recentFeedbacks = feedbacks.slice(0, 10);
  const olderFeedbacks = feedbacks.slice(10);

  const recentAverageRating = recentFeedbacks.reduce((sum: number, f: AgentFeedback) => sum + f.rating, 0) / recentFeedbacks.length;
  const olderAverageRating = olderFeedbacks.reduce((sum: number, f: AgentFeedback) => sum + f.rating, 0) / olderFeedbacks.length;

  const recentAverageSentiment = recentFeedbacks.reduce((sum: number, f: AgentFeedback) => sum + (f.sentimentScore ? Number(f.sentimentScore) : 0), 0) / recentFeedbacks.length;
  const olderAverageSentiment = olderFeedbacks.reduce((sum: number, f: AgentFeedback) => sum + (f.sentimentScore ? Number(f.sentimentScore) : 0), 0) / olderFeedbacks.length;

  const monthlyData = feedbacks.reduce((acc: Array<{ month: string; count: number; averageRating: number; averageSentiment: number }>, feedback: AgentFeedback) => {
    const month = feedback.createdAt.toISOString().slice(0, 7);
    const existingMonth = acc.find(m => m.month === month);
    if (existingMonth) {
      existingMonth.count++;
      existingMonth.averageRating = (existingMonth.averageRating * (existingMonth.count - 1) + feedback.rating) / existingMonth.count;
      existingMonth.averageSentiment = (existingMonth.averageSentiment * (existingMonth.count - 1) + (feedback.sentimentScore || 0)) / existingMonth.count;
    } else {
      acc.push({
        month,
        count: 1,
        averageRating: feedback.rating,
        averageSentiment: feedback.sentimentScore || 0,
      });
    }
    return acc;
  }, []);

  return {
    totalFeedbacks: feedbacks.length,
    averageRating: feedbacks.length > 0
      ? feedbacks.reduce((sum: number, f: AgentFeedback) => sum + f.rating, 0) / feedbacks.length
      : 0,
    sentimentDistribution,
    categoryDistribution,
    recentTrends: {
      averageRating: recentAverageRating - olderAverageRating,
      sentimentScore: recentAverageSentiment - olderAverageSentiment,
    },
    monthlyData,
  };
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

    const trends = feedbacks.map((feedback: AgentFeedback) => ({
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
      ? feedbacks.reduce((sum: number, f: AgentFeedback) => sum + f.rating, 0) / totalFeedbacks
      : 0;

    const sentimentCounts = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    feedbacks.forEach((feedback: AgentFeedback) => {
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
    feedbacks.forEach((feedback: AgentFeedback) => {
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