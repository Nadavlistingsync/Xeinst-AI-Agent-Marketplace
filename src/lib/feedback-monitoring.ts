import { prisma } from '@/lib/prisma';
import { AgentFeedback } from './schema';
import { createNotification, NotificationType, NotificationSeverity } from './notification';
import { Decimal } from '@prisma/client/runtime/library';

export interface FeedbackMetrics {
  totalFeedback: number;
  averageRating: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  categoryDistribution: Record<string, number>;
  timeDistribution: Record<string, { count: number; sentiment: number }>;
  trends: {
    rating: number;
    sentiment: number;
    volume: number;
  };
  responseRate: number;
  averageResponseTime: number;
}

export interface FeedbackTimeRange {
  startDate?: Date;
  endDate?: Date;
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

export async function getFeedbackMetrics(
  agentId: string,
  timeRange?: FeedbackTimeRange
): Promise<FeedbackMetrics> {
  const where: any = { agentId };
  if (timeRange) {
    where.createdAt = {
      gte: timeRange.startDate,
      lte: timeRange.endDate,
    };
  }

  const feedbacks = await prisma.agentFeedback.findMany({
    where,
  });

  const totalFeedbacks = feedbacks.length;
  const averageRating = feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / totalFeedbacks || 0;

  const sentimentDistribution = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  const categoryDistribution: Record<string, number> = {};

  feedbacks.forEach((feedback) => {
    const sentiment = typeof feedback.sentimentScore === 'object' && feedback.sentimentScore !== null && 'toNumber' in feedback.sentimentScore
      ? feedback.sentimentScore.toNumber()
      : feedback.sentimentScore || 0;
    if (sentiment > 0.3) sentimentDistribution.positive++;
    else if (sentiment < -0.3) sentimentDistribution.negative++;
    else sentimentDistribution.neutral++;

    const categories = Array.isArray(feedback.categories)
      ? feedback.categories
      : typeof feedback.categories === 'string'
        ? [feedback.categories]
        : [];
    categories.forEach((category) => {
      if (typeof category === 'string') {
        categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
      }
    });
  });

  const responseRate = feedbacks.filter((f) => f.creatorResponse).length / totalFeedbacks || 0;

  const averageResponseTime = feedbacks.reduce((sum, f) => {
    if (f.creatorResponse && f.responseDate) {
      return sum + (f.responseDate.getTime() - f.createdAt.getTime());
    }
    return sum;
  }, 0) / feedbacks.filter((f) => f.creatorResponse && f.responseDate).length || 0;

  return {
    totalFeedback: totalFeedbacks,
    averageRating,
    sentimentDistribution,
    categoryDistribution,
    timeDistribution: {},
    trends: {
      rating: 0,
      sentiment: 0,
      volume: 0
    },
    responseRate,
    averageResponseTime
  };
}

export async function monitorFeedback(agentId: string): Promise<void> {
  try {
    const metrics = await getFeedbackMetrics(agentId);
    const agent = await prisma.deployment.findUnique({
      where: { id: agentId },
      include: { creator: true },
    });

    if (!agent) {
      console.warn(`Agent ${agentId} not found during feedback monitoring`);
      return;
    }

    const notifications: Array<{
      type: NotificationType;
      severity: NotificationSeverity;
      title: string;
      message: string;
    }> = [];

    // Check sentiment
    if (metrics.sentimentDistribution.negative > metrics.totalFeedback * 0.3) {
      notifications.push({
        type: 'sentiment_alert',
        severity: 'warning',
        title: 'Negative Feedback Alert',
        message: `Agent ${agent.name} has received ${Math.round(
          (metrics.sentimentDistribution.negative / metrics.totalFeedback) * 100
        )}% negative feedback.`,
      });
    }

    // Check ratings
    if (metrics.averageRating < 3) {
      notifications.push({
        type: 'rating_alert',
        severity: 'error',
        title: 'Low Rating Alert',
        message: `Agent ${agent.name} has an average rating of ${metrics.averageRating.toFixed(1)}.`,
      });
    }

    // Check response rate
    if (metrics.responseRate < 0.5) {
      notifications.push({
        type: 'feedback_alert',
        severity: 'warning',
        title: 'Low Response Rate',
        message: `Agent ${agent.name} has a response rate of ${Math.round(
          metrics.responseRate * 100
        )}%.`,
      });
    }

    // Send notifications
    if (notifications.length > 0) {
      await Promise.all(
        notifications.map((notification) =>
          createNotification({
            userId: agent.creator.id,
            ...notification,
            metadata: {
              agentId,
              metrics,
            },
          })
        )
      );
    }
  } catch (error) {
    console.error(`Error monitoring feedback for agent ${agentId}:`, error);
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
  options: FeedbackTimeRange & { includeDetails?: boolean }
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

    const metrics = await getFeedbackMetrics(agentId, options);
    return metrics;
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
      sentimentScore: feedback.sentimentScore,
      categories: feedback.categories
    },
    severity: 'info',
    user_id: agentId // or the correct userId if available
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
  const metrics = await getFeedbackMetrics(agentId, timeRange);

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  // Analyze strengths
  if (analysis.sentimentDistribution.positive > analysis.sentimentDistribution.negative) {
    strengths.push('High positive sentiment in feedback');
  }
  if (metrics.averageRating >= 4) {
    strengths.push('High average rating');
  }
  if (metrics.responseRate >= 0.8) {
    strengths.push('Excellent response rate');
  }

  // Analyze weaknesses
  if (analysis.sentimentDistribution.negative > analysis.sentimentDistribution.positive) {
    weaknesses.push('Negative sentiment in feedback');
  }
  if (metrics.averageRating < 3) {
    weaknesses.push('Low average rating');
  }
  if (metrics.responseRate < 0.5) {
    weaknesses.push('Low response rate');
  }

  // Generate recommendations
  if (analysis.trends.rating < 0) {
    recommendations.push('Investigate recent rating decline');
  }
  if (analysis.trends.sentiment < 0) {
    recommendations.push('Address negative sentiment trends');
  }
  if (analysis.trends.volume > 0) {
    recommendations.push('Increase feedback volume');
  }

  return {
    strengths,
    weaknesses,
    recommendations,
  };
}

export async function updateAgentBasedOnFeedback(
  agentId: string,
  feedback: AgentFeedback
): Promise<void> {
  const agent = await prisma.deployment.findUnique({
    where: { id: agentId },
  });

  if (!agent) {
    throw new Error(`Agent ${agentId} not found`);
  }

  const updates: any = {};

  // Update rating if provided
  if (feedback.rating) {
    const currentRating = agent.rating || 0;
    const currentRatingCount = agent.ratingCount || 0;
    const newRatingCount = currentRatingCount + 1;
    const newRating = ((currentRating * currentRatingCount) + feedback.rating) / newRatingCount;

    updates.rating = newRating;
    updates.ratingCount = newRatingCount;
  }

  // Update status based on feedback
  if (feedback.rating && feedback.rating < 2) {
    updates.status = 'needs_attention';
  }

  // Apply updates
  await prisma.deployment.update({
    where: { id: agentId },
    data: updates,
  });

  // Create notification for agent creator
  await notifyAgentCreator(agentId, {
    type: 'feedback_received',
    message: `New feedback received for agent ${agent.name}`,
    sentimentScore: feedback.sentimentScore,
    categories: feedback.categories as string[],
  });
}

async function getPreviousMetrics(agentId: string): Promise<FeedbackMetrics | null> {
  const timeRange = {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  };

  return await getFeedbackMetrics(agentId, timeRange);
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

export async function processFeedback(feedback: {
  id: string;
  agentId: string;
  rating: number;
  sentimentScore: Decimal | null;
  categories: any;
  comment: string | null;
}) {
  try {
    const agent = await prisma.deployment.findUnique({
      where: { id: feedback.agentId },
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
      throw new Error('Agent not found');
    }

    // Update agent metrics
    const currentRating = agent.rating || 0;
    const currentTotalRatings = agent.totalRatings || 0;
    const newTotalRatings = currentTotalRatings + 1;
    const newRating = ((currentRating * currentTotalRatings) + feedback.rating) / newTotalRatings;

    await prisma.deployment.update({
      where: { id: feedback.agentId },
      data: {
        rating: newRating,
        totalRatings: newTotalRatings
      }
    });

    // Create notification for agent creator
    await createNotification({
      type: 'feedback_received' as NotificationType,
      title: 'New Feedback Received',
      message: `New feedback received for ${agent.name}`,
      metadata: {
        agentId: feedback.agentId,
        sentimentScore: feedback.sentimentScore ? Number(feedback.sentimentScore) : undefined,
        categories: feedback.categories ? Object.keys(feedback.categories) : undefined
      },
      severity: 'info',
      userId: agent.createdBy
    });

    return true;
  } catch (error) {
    console.error('Error processing feedback:', error);
    return false;
  }
} 