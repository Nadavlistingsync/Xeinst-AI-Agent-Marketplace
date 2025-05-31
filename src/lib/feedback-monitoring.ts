import { prismaClient } from './db';
import { AgentFeedback } from './schema';
import { createNotification, NotificationType, NotificationSeverity } from './notification';

export interface FeedbackMetrics {
  totalFeedbacks: number;
  average_rating: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  responseRate: number;
  averageResponseTime: number;
  categoryDistribution: Record<string, number>;
}

export interface FeedbackTimeRange {
  start_date: Date;
  end_date: Date;
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
  start_date?: Date;
  end_date?: Date;
  limit?: number;
}

export async function getFeedbackMetrics(
  agentId: string,
  timeRange?: FeedbackTimeRange
): Promise<FeedbackMetrics> {
  const where: any = { agentId };
  if (timeRange) {
    where.created_at = {
      gte: timeRange.start_date,
      lte: timeRange.end_date,
    };
  }

  const feedbacks = await prismaClient.agentFeedback.findMany({
    where,
  });

  const totalFeedbacks = feedbacks.length;
  const average_rating = feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / totalFeedbacks || 0;

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
      return sum + (f.responseDate.getTime() - f.created_at.getTime());
    }
    return sum;
  }, 0) / feedbacks.filter((f) => f.creatorResponse && f.responseDate).length || 0;

  return {
    totalFeedbacks,
    average_rating,
    sentimentDistribution,
    responseRate,
    averageResponseTime,
    categoryDistribution,
  };
}

export async function monitorFeedback(agentId: string): Promise<void> {
  const metrics = await getFeedbackMetrics(agentId);
  const agent = await prismaClient.agent.findUnique({
    where: { id: agentId },
    include: { user: true },
  });

  if (!agent) return;

  const notifications: Array<{
    type: NotificationType;
    severity: NotificationSeverity;
    title: string;
    message: string;
  }> = [];

  // Check sentiment
  if (metrics.sentimentDistribution.negative > metrics.totalFeedbacks * 0.3) {
    notifications.push({
      type: 'sentiment_alert',
      severity: 'warning',
      title: 'Negative Feedback Alert',
      message: `Agent ${agent.name} has received ${Math.round(
        (metrics.sentimentDistribution.negative / metrics.totalFeedbacks) * 100
      )}% negative feedback.`,
    });
  }

  // Check ratings
  if (metrics.average_rating < 3) {
    notifications.push({
      type: 'rating_alert',
      severity: 'error',
      title: 'Low Rating Alert',
      message: `Agent ${agent.name} has an average rating of ${metrics.average_rating.toFixed(1)}.`,
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
  await Promise.all(
    notifications.map((notification) =>
      createNotification({
        user_id: agent.user_id,
        ...notification,
        metadata: {
          agentId,
          metrics,
        },
      })
    )
  );
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
  timeRange?: FeedbackTimeRange
): Promise<FeedbackAnalysis> {
  const metrics = await getFeedbackMetrics(agentId, timeRange);
  const previousMetrics = timeRange
    ? await getFeedbackMetrics(agentId, {
        start_date: new Date(timeRange.start_date.getTime() - (timeRange.end_date.getTime() - timeRange.start_date.getTime())),
        end_date: timeRange.start_date,
      })
    : null;

  const sentimentScore = metrics.sentimentDistribution.positive - metrics.sentimentDistribution.negative;

  const topCategories = Object.entries(metrics.categoryDistribution)
    .map(([category, count]) => ({
      category,
      count,
      percentage: count / metrics.totalFeedbacks,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const trends = {
    rating: previousMetrics
      ? metrics.average_rating - previousMetrics.average_rating
      : 0,
    sentiment: previousMetrics
      ? sentimentScore - (previousMetrics.sentimentDistribution.positive - previousMetrics.sentimentDistribution.negative)
      : 0,
    responseTime: previousMetrics
      ? metrics.averageResponseTime - previousMetrics.averageResponseTime
      : 0,
  };

  return {
    sentimentScore,
    sentimentDistribution: metrics.sentimentDistribution,
    categoryDistribution: metrics.categoryDistribution,
    responseRate: metrics.responseRate,
    averageResponseTime: metrics.averageResponseTime,
    topCategories,
    trends,
  };
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
  timeRange: FeedbackTimeRange
): Promise<{
  ratings: Array<{ date: Date; value: number }>;
  sentiment: Array<{ date: Date; value: number }>;
  responseTime: Array<{ date: Date; value: number }>;
}> {
  const feedbacks = await prismaClient.agentFeedback.findMany({
    where: {
      agentId,
      created_at: {
        gte: timeRange.start_date,
        lte: timeRange.end_date,
      },
    },
    orderBy: { created_at: 'asc' },
  });

  const dailyData = new Map<string, {
    ratings: number[];
    sentiment: number[];
    responseTime: number[];
  }>();

  feedbacks.forEach((feedback) => {
    const date = feedback.created_at.toISOString().split('T')[0];
    if (!dailyData.has(date)) {
      dailyData.set(date, {
        ratings: [],
        sentiment: [],
        responseTime: [],
      });
    }

    const dayData = dailyData.get(date)!;
    if (feedback.rating) dayData.ratings.push(feedback.rating);
    if (feedback.sentimentScore) {
      const sentiment = typeof feedback.sentimentScore === 'object' && feedback.sentimentScore !== null && 'toNumber' in feedback.sentimentScore
        ? feedback.sentimentScore.toNumber()
        : feedback.sentimentScore;
      dayData.sentiment.push(sentiment);
    }
    if (feedback.creatorResponse && feedback.responseDate) {
      dayData.responseTime.push(
        feedback.responseDate.getTime() - feedback.created_at.getTime()
      );
    }
  });

  return {
    ratings: Array.from(dailyData.entries()).map(([date, data]) => ({
      date: new Date(date),
      value: data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length || 0,
    })),
    sentiment: Array.from(dailyData.entries()).map(([date, data]) => ({
      date: new Date(date),
      value: data.sentiment.reduce((sum, s) => sum + s, 0) / data.sentiment.length || 0,
    })),
    responseTime: Array.from(dailyData.entries()).map(([date, data]) => ({
      date: new Date(date),
      value: data.responseTime.reduce((sum, t) => sum + t, 0) / data.responseTime.length || 0,
    })),
  };
}

export async function getFeedbackInsights(
  agentId: string,
  timeRange?: FeedbackTimeRange
): Promise<{
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}> {
  const analysis = await analyzeAgentFeedback(agentId, timeRange);
  const metrics = await getFeedbackMetrics(agentId, timeRange);

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  // Analyze strengths
  if (analysis.sentimentScore > 0.5) {
    strengths.push('High positive sentiment in feedback');
  }
  if (metrics.average_rating >= 4) {
    strengths.push('High average rating');
  }
  if (metrics.responseRate >= 0.8) {
    strengths.push('Excellent response rate');
  }

  // Analyze weaknesses
  if (analysis.sentimentScore < -0.3) {
    weaknesses.push('Negative sentiment in feedback');
  }
  if (metrics.average_rating < 3) {
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
  if (analysis.trends.responseTime > 0) {
    recommendations.push('Improve response time');
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
  const agent = await prismaClient.agent.findUnique({
    where: { id: agentId },
  });

  if (!agent) return;

  const updates: any = {};

  // Update rating
  if (feedback.rating) {
    const currentRating = agent.rating || 0;
    const currentCount = agent.download_count || 0;
    updates.rating = (currentRating * currentCount + feedback.rating) / (currentCount + 1);
    updates.download_count = currentCount + 1;
  }

  // Update status based on sentiment
  if (feedback.sentimentScore !== null) {
    if (feedback.sentimentScore < -0.5) {
      updates.status = 'needs_improvement';
    } else if (feedback.sentimentScore > 0.5) {
      updates.status = 'stable';
    }
  }

  await prismaClient.agent.update({
    where: { id: agentId },
    data: updates,
  });
}

async function getPreviousMetrics(agentId: string): Promise<FeedbackMetrics | null> {
  const timeRange = {
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  };

  return await getFeedbackMetrics(agentId, timeRange);
} 