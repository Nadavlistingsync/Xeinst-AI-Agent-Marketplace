import { Prisma } from '@prisma/client';
import type { NotificationType, AgentFeedback } from '../types/prisma';
import { prisma } from "./prisma";
import { createNotification } from './notification';

export interface FeedbackMetrics {
  totalFeedback: number;
  averageRating: number;
  averageSentiment: number;
  sentimentDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  timeSeriesData: Array<{
    date: Date;
    rating: number;
    sentiment: number;
  }>;
  responseRate?: number;
  trends?: {
    rating: number;
    sentiment: number;
    volume: number;
  };
}

export interface FeedbackTimeRange {
  startDate?: Date;
  endDate?: Date;
  days?: number;
}

export interface FeedbackAnalysis {
  sentimentScore: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  categoryDistribution: Record<string, number>;
  responseRate: number;
  averageResponseTime: number;
  topCategories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  trends: {
    rating: number;
    sentiment: number;
    responseTime: number;
  };
}

export interface GetFeedbackOptions {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export async function createFeedback(data: {
  deploymentId: string;
  userId: string;
  rating: number;
  comment?: string | null;
  sentimentScore?: number | null;
  categories?: Record<string, any> | null;
  metadata?: Prisma.InputJsonValue;
}): Promise<AgentFeedback> {
  const sentimentScore = data.sentimentScore ?? 0;
  
  const feedback = await prisma.agentFeedback.create({
    data: {
      deploymentId: data.deploymentId,
      userId: data.userId,
      rating: data.rating,
      comment: data.comment || null,
      sentimentScore,
      categories: data.categories ? (data.categories as Prisma.InputJsonValue) : Prisma.JsonNull,
      metadata: data.metadata || Prisma.JsonNull,
      responseDate: null
    },
  });

  return {
    ...feedback,
    sentimentScore: Number(feedback.sentimentScore),
    categories: feedback.categories as Record<string, any> | null
  };
}

export async function getFeedbackMetrics(deploymentId: string): Promise<FeedbackMetrics> {
  const feedbacks = await prisma.agentFeedback.findMany({
    where: {
      deploymentId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const totalFeedback = feedbacks.length;
  const averageRating = feedbacks.reduce((acc: number, f: AgentFeedback) => acc + f.rating, 0) / totalFeedback || 0;
  const averageSentiment = feedbacks.reduce((acc: number, f: AgentFeedback) => acc + Number(f.sentimentScore), 0) / totalFeedback || 0;

  const sentimentDistribution = feedbacks.reduce((acc: Record<string, number>, feedback: AgentFeedback) => {
    const score = feedback.sentimentScore ? Math.round(feedback.sentimentScore * 10) / 10 : 0;
    acc[score] = (acc[score] || 0) + 1;
    return acc;
  }, {});

  const categoryDistribution = feedbacks.reduce((acc: Record<string, number>, feedback: AgentFeedback) => {
    if (feedback.categories) {
      Object.entries(feedback.categories as Record<string, any>).forEach(([category]) => {
        acc[category] = (acc[category] || 0) + 1;
      });
    }
    return acc;
  }, {});

  feedbacks.forEach((feedback: AgentFeedback) => {
    if (feedback.sentimentScore && feedback.sentimentScore < 0.3) {
      createNotification({
        type: 'feedback_alert' as NotificationType,
        message: `Low sentiment score detected for deployment ${deploymentId}`,
        userId: feedback.userId,
        metadata: {
          feedbackId: feedback.id,
          sentimentScore: feedback.sentimentScore,
          comment: feedback.comment
        }
      });
    }
  });

  const timeSeriesData = feedbacks.map((feedback: AgentFeedback) => ({
    date: new Date(feedback.createdAt),
    rating: feedback.rating,
    sentiment: feedback.sentimentScore || 0
  }));

  return {
    averageRating,
    averageSentiment,
    totalFeedback,
    sentimentDistribution,
    categoryDistribution,
    timeSeriesData
  };
}

export async function monitorFeedback(deploymentId: string) {
  const metrics = await getFeedbackMetrics(deploymentId);
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId }
  });

  if (!deployment) return;

  if (metrics.averageSentiment < -0.5) {
    await createNotification({
      userId: deployment.createdBy,
      type: 'feedback_alert' as NotificationType,
      message: `Your agent "${deployment.name}" is receiving negative feedback`,
      metadata: {
        sentimentScore: metrics.averageSentiment,
        categories: metrics.categoryDistribution
      }
    });
  }
}

interface FeedbackCategory {
  name: string;
  keywords: string[];
  weight: number;
}

const FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  {
    name: 'Performance',
    keywords: ['slow', 'fast', 'speed', 'performance', 'response time', 'latency'],
    weight: 1.2,
  },
  {
    name: 'Reliability',
    keywords: ['crash', 'error', 'bug', 'stable', 'reliable', 'unstable'],
    weight: 1.5,
  },
  {
    name: 'Usability',
    keywords: ['easy', 'difficult', 'intuitive', 'confusing', 'user-friendly', 'interface'],
    weight: 1.0,
  },
  {
    name: 'Features',
    keywords: ['feature', 'functionality', 'missing', 'needs', 'want', 'would like'],
    weight: 0.8,
  },
  {
    name: 'Documentation',
    keywords: ['documentation', 'guide', 'tutorial', 'help', 'instructions', 'readme'],
    weight: 0.7,
  },
];

export async function analyzeAgentFeedback(
  agentId: string,
  _options: FeedbackTimeRange & { includeDetails?: boolean }
): Promise<FeedbackMetrics | null> {
  try {
    const agent = await prisma.deployment.findUnique({
      where: { id: agentId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    if (!agent) {
      return null;
    }

    const metrics = await getFeedbackMetrics(agentId);
    return {
      ...metrics,
      responseRate: 0, // Default value
      trends: {
        rating: 0,
        sentiment: 0,
        volume: 0
      }
    };
  } catch (error) {
    console.error(`Error analyzing feedback for agent ${agentId}:`, error);
    return null;
  }
}

export async function notifyAgentCreator(
  agentId: string,
  feedback: {
    type: NotificationType;
    message: string;
    sentimentScore?: number;
    categories?: string[];
  }
): Promise<void> {
  await createNotification({
    type: feedback.type,
    message: feedback.message,
    metadata: {
      agentId,
      sentimentScore: typeof feedback.sentimentScore === 'number' ? feedback.sentimentScore : 0,
      categories: (feedback.categories && typeof feedback.categories === 'object' && !Array.isArray(feedback.categories)) ? feedback.categories as Record<string, number> : null
    },
    userId: agentId
  });
}

export async function getFeedbackTrends(
  agentId: string,
  options: FeedbackTimeRange & { groupBy?: 'day' | 'week' | 'month' }
) {
  try {
    const where = {
      agentId,
      ...(options.startDate && {
        createdAt: {
          gte: options.startDate
        }
      }),
      ...(options.endDate && {
        createdAt: {
          lte: options.endDate
        }
      })
    };

    const feedback = await prisma.agentFeedback.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });

    const trends: Array<{
      date: string;
      count: number;
      averageRating: number;
      averageSentiment: number;
    }> = [];

    const groupedData: Record<string, { count: number; totalRating: number; totalSentiment: number }> = {};

    feedback.forEach((item) => {
      let dateKey: string;
      const date = new Date(item.createdAt);

      switch (options.groupBy || 'day') {
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          dateKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default: // day
          dateKey = date.toISOString().split('T')[0];
      }

      if (!groupedData[dateKey]) {
        groupedData[dateKey] = {
          count: 0,
          totalRating: 0,
          totalSentiment: 0
        };
      }

      groupedData[dateKey].count++;
      groupedData[dateKey].totalRating += item.rating;
      if (item.sentimentScore) {
        groupedData[dateKey].totalSentiment += Number(item.sentimentScore);
      }
    });

    Object.entries(groupedData).forEach(([date, data]) => {
      trends.push({
        date,
        count: data.count,
        averageRating: data.totalRating / data.count,
        averageSentiment: data.totalSentiment / data.count
      });
    });

    return trends.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error getting feedback trends:', error);
    return [];
  }
}

export async function getFeedbackInsights(
  agentId: string,
  timeRange?: FeedbackTimeRange
): Promise<{
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}> {
  const analysis = await analyzeAgentFeedback(agentId, { startDate: timeRange?.startDate, endDate: timeRange?.endDate });
  const metrics = await getFeedbackMetrics(agentId);

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  // Analyze strengths
  if (analysis && analysis.sentimentDistribution.positive > analysis.sentimentDistribution.negative) {
    strengths.push('High positive sentiment in feedback');
  }
  if (metrics.averageRating >= 4) {
    strengths.push('High average rating');
  }
  if (typeof metrics.responseRate === 'number' && metrics.responseRate >= 0.8) {
    strengths.push('Excellent response rate');
  }

  // Analyze weaknesses
  if (analysis && analysis.sentimentDistribution.negative > analysis.sentimentDistribution.positive) {
    weaknesses.push('Negative sentiment in feedback');
  }
  if (metrics.averageRating < 3) {
    weaknesses.push('Low average rating');
  }
  if (typeof metrics.responseRate === 'number' && metrics.responseRate < 0.5) {
    weaknesses.push('Low response rate');
  }

  // Generate recommendations
  if (analysis && analysis.trends && analysis.trends.rating < 0) {
    recommendations.push('Investigate recent rating decline');
  }
  if (analysis && analysis.trends && analysis.trends.sentiment < 0) {
    recommendations.push('Address negative sentiment trends');
  }
  if (analysis && analysis.trends && analysis.trends.volume > 0) {
    recommendations.push('Increase feedback volume');
  }

  return {
    strengths,
    weaknesses,
    recommendations,
  };
}

export async function updateAgentBasedOnFeedback(deploymentId: string, _feedback: AgentFeedback): Promise<void> {
  // Implementation will be added later
  console.log(`Updating agent ${deploymentId} based on feedback`);
}

export async function analyzeFeedback(feedback: {
  text: string;
  rating: number;
  categories?: string[];
}): Promise<{
  sentimentScore: number;
  categories: string[];
  keyPhrases: string[];
}> {
  // Simple sentiment analysis based on rating
  const sentimentScore = (feedback.rating - 3) / 2; // Convert 1-5 rating to -1 to 1 scale

  // Extract categories from feedback text
  const categories = feedback.categories || [];
  const text = feedback.text.toLowerCase();

  // Add categories based on keywords
  FEEDBACK_CATEGORIES.forEach((category) => {
    if (category.keywords.some((keyword) => text.includes(keyword.toLowerCase()))) {
      if (!categories.includes(category.name)) {
        categories.push(category.name);
      }
    }
  });

  // Extract key phrases (simple implementation)
  const keyPhrases = text
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
    .slice(0, 3); // Take top 3 sentences as key phrases

  return {
    sentimentScore,
    categories,
    keyPhrases,
  };
} 