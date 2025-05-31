import { prisma } from './prisma';
import { agentFeedbacks, agents } from './schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { analyzeFeedback } from './feedback-analysis';
import { createNotification } from './notifications';

export interface FeedbackMetrics {
  totalFeedbacks: number;
  averageRating: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  categoryDistribution: {
    [key: string]: number;
  };
  responseRate: number;
  averageResponseTime: number;
}

export interface FeedbackTimeRange {
  start: Date;
  end: Date;
}

export interface FeedbackAnalysis {
  sentimentScore: number;
  categories: string[];
  positiveFeedback: string[];
  negativeFeedback: string[];
  trends: {
    sentiment: number;
    rating: number;
    volume: number;
  };
  totalFeedbacks: number;
  averageRating: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  categoryDistribution: {
    [key: string]: number;
  };
  responseRate: number;
  averageResponseTime: number;
}

export interface GetFeedbackOptions {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export async function getFeedbackMetrics(
  agentId: string,
  timeRange: FeedbackTimeRange
): Promise<FeedbackMetrics> {
  const feedbacks = await prisma.agentFeedback.findMany({
    where: {
      agentId,
      createdAt: {
        gte: timeRange.start,
        lte: timeRange.end
      }
    },
    include: { user: true }
  });

  const totalFeedbacks = feedbacks.length;
  const averageRating = feedbacks.reduce((acc, f) => acc + f.rating, 0) / totalFeedbacks || 0;

  const sentimentDistribution = feedbacks.reduce((acc, f) => {
    const sentiment = f.sentimentScore ? parseFloat(f.sentimentScore) : 0;
    if (sentiment > 0.3) acc.positive++;
    else if (sentiment < -0.3) acc.negative++;
    else acc.neutral++;
    return acc;
  }, { positive: 0, neutral: 0, negative: 0 });

  const categoryDistribution = feedbacks.reduce((acc, f) => {
    if (f.categories) {
      Object.entries(f.categories).forEach(([category, score]) => {
        acc[category] = (acc[category] || 0) + score;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const respondedFeedbacks = feedbacks.filter(f => f.creatorResponse !== null);
  const responseRate = (respondedFeedbacks.length / totalFeedbacks) * 100 || 0;

  const averageResponseTime = respondedFeedbacks.reduce((acc, f) => {
    if (f.responseDate && f.createdAt) {
      return acc + (f.responseDate.getTime() - f.createdAt.getTime());
    }
    return acc;
  }, 0) / respondedFeedbacks.length || 0;

  return {
    totalFeedbacks,
    averageRating,
    sentimentDistribution,
    categoryDistribution,
    responseRate,
    averageResponseTime
  };
}

export async function monitorFeedback(agentId: string): Promise<void> {
  const timeRange = {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  };

  const metrics = await analyzeFeedback(agentId, timeRange);

  if (metrics.sentimentScore < -0.3 || metrics.negativeFeedback > metrics.positiveFeedback) {
    // Send notification for negative feedback
    console.warn(`Negative feedback detected for agent ${agentId}`);
  }

  if (metrics.averageRating < 3) {
    // Send notification for low ratings
    console.warn(`Low ratings detected for agent ${agentId}`);
  }

  if (metrics.trends.sentiment < -0.2) {
    // Send notification for declining sentiment
    console.warn(`Declining sentiment detected for agent ${agentId}`);
  }

  if (metrics.trends.rating < -0.5) {
    // Send notification for declining ratings
    console.warn(`Declining ratings detected for agent ${agentId}`);
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

export async function analyzeFeedback(agentId: string): Promise<FeedbackAnalysis> {
  try {
    const feedbacks = await prisma.agentFeedback.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' }
    });

    const totalFeedbacks = feedbacks.length;
    const averageRating = feedbacks.reduce((acc, f) => acc + f.rating, 0) / totalFeedbacks || 0;
    
    const sentimentDistribution = {
      positive: feedbacks.filter(f => Number(f.sentimentScore) > 0.3).length / totalFeedbacks || 0,
      neutral: feedbacks.filter(f => Number(f.sentimentScore) >= -0.3 && Number(f.sentimentScore) <= 0.3).length / totalFeedbacks || 0,
      negative: feedbacks.filter(f => Number(f.sentimentScore) < -0.3).length / totalFeedbacks || 0
    };

    const categories = Array.from(new Set(feedbacks.flatMap(f => 
      f.categories ? Object.keys(f.categories) : []
    )));

    const categoryDistribution = categories.reduce((acc, category) => {
      acc[category] = feedbacks.filter(f => f.categories && f.categories[category]).length / totalFeedbacks || 0;
      return acc;
    }, {} as { [key: string]: number });

    const responseRate = feedbacks.filter(f => f.creatorResponse).length / totalFeedbacks || 0;
    
    const averageResponseTime = feedbacks
      .filter(f => f.responseDate && f.createdAt)
      .reduce((acc, f) => {
        const responseTime = new Date(f.responseDate!).getTime() - new Date(f.createdAt).getTime();
        return acc + responseTime;
      }, 0) / feedbacks.filter(f => f.responseDate).length || 0;

    const trends = {
      sentiment: feedbacks.reduce((acc, f) => acc + Number(f.sentimentScore || 0), 0) / totalFeedbacks || 0,
      rating: averageRating,
      volume: totalFeedbacks
    };

    const positiveFeedback = feedbacks
      .filter(f => Number(f.sentimentScore) > 0.3 && f.comment)
      .map(f => f.comment!)
      .slice(0, 5);

    const negativeFeedback = feedbacks
      .filter(f => Number(f.sentimentScore) < -0.3 && f.comment)
      .map(f => f.comment!)
      .slice(0, 5);

    return {
      sentimentScore: trends.sentiment,
      categories,
      positiveFeedback,
      negativeFeedback,
      trends,
      totalFeedbacks,
      averageRating,
      sentimentDistribution,
      categoryDistribution,
      responseRate,
      averageResponseTime
    };
  } catch (error) {
    console.error('Error analyzing feedback:', error);
    throw error;
  }
}

export async function notifyAgentCreator(
  agentId: string,
  feedback: {
    type: string;
    message: string;
    sentimentScore?: number;
    categories?: string[];
  }
): Promise<void> {
  const agentDetails = await prisma.agent.findMany({
    where: { id: agentId },
    limit: 1
  });

  if (agentDetails.length === 0 || !agentDetails[0].deployedBy) {
    return;
  }

  const notificationTitle = `New Feedback for ${agentDetails[0].name}`;
  const notificationMessage = `Received ${feedback.type} feedback: ${feedback.message}`;

  await createNotification({
    userId: agentDetails[0].deployedBy,
    type: 'feedback',
    title: notificationTitle,
    message: notificationMessage,
    metadata: {
      agentId,
      feedbackType: feedback.type,
      sentimentScore: feedback.sentimentScore,
      categories: feedback.categories,
    },
  });
}

export async function getFeedbackTrends(agentId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const feedback = await prisma.agentFeedback.findMany({
    where: {
      agentId,
      createdAt: {
        gte: startDate
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  const dailyStats = feedback.reduce((acc, curr) => {
    const date = curr.createdAt.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        count: 0,
        totalRating: 0,
        totalSentiment: 0
      };
    }
    acc[date].count++;
    acc[date].totalRating += curr.rating;
    if (curr.sentimentScore) {
      acc[date].totalSentiment += curr.sentimentScore;
    }
    return acc;
  }, {} as Record<string, { count: number; totalRating: number; totalSentiment: number }>);

  return Object.entries(dailyStats).map(([date, stats]) => ({
    date,
    count: stats.count,
    averageRating: stats.totalRating / stats.count,
    averageSentiment: stats.totalSentiment / stats.count
  }));
}

export async function getFeedbackInsights(agentId: string) {
  const feedback = await prisma.agentFeedback.findMany({
    where: { agentId },
    include: { user: true }
  });

  const insights = {
    topIssues: [] as string[],
    commonPraise: [] as string[],
    improvementAreas: [] as string[],
    userSegments: {} as Record<string, number>
  };

  // Analyze feedback comments
  feedback.forEach(f => {
    if (f.comment) {
      const comment = f.comment.toLowerCase();
      
      // Simple sentiment analysis
      if (f.rating >= 4) {
        insights.commonPraise.push(comment);
      } else if (f.rating <= 2) {
        insights.topIssues.push(comment);
      } else {
        insights.improvementAreas.push(comment);
      }
    }

    // Track user segments
    if (f.user.subscriptionTier) {
      insights.userSegments[f.user.subscriptionTier] = (insights.userSegments[f.user.subscriptionTier] || 0) + 1;
    }
  });

  return insights;
}

export async function updateAgentBasedOnFeedback(agentId: string): Promise<void> {
  const metrics = await analyzeFeedback(agentId);
  
  // Get agent details for notification
  const agent = await prisma.agent.findMany({
    where: { id: agentId },
    limit: 1
  });

  if (agent.length === 0) return;

  const agentDetails = agent[0];
  
  // If sentiment score is low or there are many negative feedbacks, mark for review
  if (metrics.sentimentDistribution.negative > metrics.sentimentDistribution.positive) {
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        status: 'needs_review',
        updatedAt: new Date()
      }
    });

    // Create notification for agent creator
    await createNotification({
      userId: agentDetails.deployedBy,
      type: 'agent_needs_review',
      title: 'Agent Needs Review',
      message: `Your agent "${agentDetails.name}" has received negative feedback and needs review.`,
      metadata: {
        agentId,
        metrics,
      },
    });
  }

  // Check for significant changes in feedback trends
  const previousMetrics = await getPreviousMetrics(agentId);
  if (previousMetrics) {
    const ratingChange = metrics.averageRating - previousMetrics.averageRating;
    if (Math.abs(ratingChange) > 0.5) {
      await createNotification({
        userId: agentDetails.deployedBy,
        type: 'feedback_trend_alert',
        title: 'Significant Rating Change',
        message: `Your agent "${agentDetails.name}" has experienced a ${ratingChange > 0 ? 'positive' : 'negative'} change in ratings.`,
        metadata: {
          agentId,
          change: ratingChange,
          currentRating: metrics.averageRating,
          previousRating: previousMetrics.averageRating,
        },
      });
    }
  }
}

async function getPreviousMetrics(agentId: string): Promise<FeedbackMetrics | null> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    return await analyzeFeedback(agentId, {
      start: thirtyDaysAgo,
      end: new Date(),
    });
  } catch (error) {
    console.error('Error getting previous metrics:', error);
    return null;
  }
} 