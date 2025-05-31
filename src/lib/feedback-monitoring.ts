import { db } from '@/lib/db';
import { agentFeedbacks, agents } from './schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { analyzeFeedback } from './feedback-analysis';
import { createNotification } from './notifications';

export interface FeedbackMetrics {
  sentimentScore: number;
  categories: Record<string, number>;
  positiveFeedback: number;
  negativeFeedback: number;
  totalFeedbacks: number;
  averageRating: number;
}

export interface FeedbackAnalysis {
  sentimentScore: number;
  categories: Record<string, number>;
  positiveFeedback: number;
  negativeFeedback: number;
  totalFeedbacks: number;
  averageRating: number;
  trends: {
    sentiment: number;
    rating: number;
  };
}

export interface GetFeedbackOptions {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export async function getFeedbackMetrics(
  agentId: string,
  timeRange: { start: Date; end: Date }
): Promise<FeedbackMetrics> {
  const feedback = await db
    .select()
    .from(agentFeedbacks)
    .where(eq(agentFeedbacks.agentId, agentId))
    .where(gte(agentFeedbacks.created_at, timeRange.start))
    .where(lte(agentFeedbacks.created_at, timeRange.end))
    .orderBy(desc(agentFeedbacks.created_at));

  const totalFeedbacks = feedback.length;
  const positiveFeedback = feedback.filter(f => f.sentiment_score && parseFloat(f.sentiment_score) > 0.3).length;
  const negativeFeedback = feedback.filter(f => f.sentiment_score && parseFloat(f.sentiment_score) < -0.3).length;
  const averageRating = feedback.reduce((acc, f) => acc + f.rating, 0) / totalFeedbacks || 0;

  const categories: Record<string, number> = {};
  feedback.forEach(f => {
    if (f.categories) {
      Object.entries(f.categories).forEach(([category, count]) => {
        categories[category] = (categories[category] || 0) + count;
      });
    }
  });

  const sentimentScore = feedback.reduce((acc, f) => {
    return acc + (f.sentiment_score ? parseFloat(f.sentiment_score) : 0);
  }, 0) / totalFeedbacks || 0;

  return {
    sentimentScore,
    categories,
    positiveFeedback,
    negativeFeedback,
    totalFeedbacks,
    averageRating
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

export async function analyzeFeedback(
  agentId: string,
  timeRange: { start: Date; end: Date }
): Promise<FeedbackAnalysis> {
  const currentMetrics = await getFeedbackMetrics(agentId, timeRange);
  const previousTimeRange = {
    start: new Date(timeRange.start.getTime() - (timeRange.end.getTime() - timeRange.start.getTime())),
    end: timeRange.start
  };
  const previousMetrics = await getFeedbackMetrics(agentId, previousTimeRange);

  const sentimentTrend = currentMetrics.sentimentScore - previousMetrics.sentimentScore;
  const ratingTrend = currentMetrics.averageRating - previousMetrics.averageRating;

  return {
    ...currentMetrics,
    trends: {
      sentiment: sentimentTrend,
      rating: ratingTrend
    }
  };
}

export async function notifyAgentCreator(
  agentId: string,
  feedback: {
    type: string;
    message: string;
    sentiment_score?: number;
    categories?: string[];
  }
): Promise<void> {
  const agentDetails = await db
    .select()
    .from(agents)
    .where(eq(agents.id, agentId))
    .limit(1);

  if (agentDetails.length === 0 || !agentDetails[0].deployed_by) {
    return;
  }

  const notificationTitle = `New Feedback for ${agentDetails[0].name}`;
  const notificationMessage = `Received ${feedback.type} feedback: ${feedback.message}`;

  await createNotification({
    userId: agentDetails[0].deployed_by,
    type: 'feedback',
    title: notificationTitle,
    message: notificationMessage,
    metadata: {
      agentId,
      feedbackType: feedback.type,
      sentimentScore: feedback.sentiment_score,
      categories: feedback.categories,
    },
  });
}

export async function getFeedbackTrends(
  agentId: string,
  timeRange: { start: Date; end: Date }
): Promise<{
  sentiment: number[];
  ratings: number[];
  dates: Date[];
}> {
  const feedback = await db
    .select()
    .from(agentFeedbacks)
    .where(eq(agentFeedbacks.agentId, agentId))
    .where(gte(agentFeedbacks.created_at, timeRange.start))
    .where(lte(agentFeedbacks.created_at, timeRange.end))
    .orderBy(agentFeedbacks.created_at);

  const dates = feedback.map(f => f.created_at);
  const sentiment = feedback.map(f => f.sentiment_score ? parseFloat(f.sentiment_score) : 0);
  const ratings = feedback.map(f => f.rating);

  return {
    sentiment,
    ratings,
    dates
  };
}

export async function updateAgentBasedOnFeedback(agentId: string): Promise<void> {
  const metrics = await analyzeFeedback(agentId);
  
  // Get agent details for notification
  const agent = await db
    .select()
    .from(agents)
    .where(eq(agents.id, agentId))
    .limit(1);

  if (!agent.length) return;

  const agentDetails = agent[0];
  
  // If sentiment score is low or there are many negative feedbacks, mark for review
  if (metrics.sentimentScore < -0.3 || metrics.negativeFeedback > metrics.positiveFeedback) {
    await db
      .update(agents)
      .set({
        status: 'needs_review',
        updated_at: new Date(),
      })
      .where(eq(agents.id, agentId));

    // Create notification for agent creator
    await createNotification({
      userId: agentDetails.deployed_by,
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
        userId: agentDetails.deployed_by,
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