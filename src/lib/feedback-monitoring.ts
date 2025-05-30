import { db } from '@/lib/db';
import { agentFeedbacks, deployments } from '@/lib/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { createNotification } from './notifications';

interface FeedbackMetrics {
  averageRating: number;
  totalFeedbacks: number;
  positiveFeedbacks: number;
  negativeFeedbacks: number;
  neutralFeedbacks: number;
  sentimentScore: number;
  commonIssues: string[];
  improvementSuggestions: string[];
  categories: {
    [key: string]: number;
  };
  responseMetrics: {
    totalResponses: number;
    averageResponseTime: number;
    responseRate: number;
  };
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

export async function analyzeFeedback(agentId: string, timeRange?: { start: Date; end: Date }): Promise<FeedbackMetrics> {
  const whereClause = timeRange
    ? and(
        eq(agentFeedbacks.agentId, agentId),
        gte(agentFeedbacks.createdAt, timeRange.start),
        lte(agentFeedbacks.createdAt, timeRange.end)
      )
    : eq(agentFeedbacks.agentId, agentId);

  const feedbacks = await db
    .select()
    .from(agentFeedbacks)
    .where(whereClause);

  const totalFeedbacks = feedbacks.length;
  const averageRating = feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / totalFeedbacks || 0;
  
  const positiveFeedbacks = feedbacks.filter(f => f.rating >= 4).length;
  const negativeFeedbacks = feedbacks.filter(f => f.rating <= 2).length;
  const neutralFeedbacks = feedbacks.filter(f => f.rating === 3).length;

  // Calculate sentiment score (-1 to 1)
  const sentimentScore = (positiveFeedbacks - negativeFeedbacks) / totalFeedbacks || 0;

  // Extract common issues and suggestions from comments
  const comments = feedbacks.map(f => f.comment).filter(Boolean) as string[];
  const commonIssues = extractCommonIssues(comments);
  const improvementSuggestions = extractImprovementSuggestions(comments);

  // Categorize feedback
  const categories = categorizeFeedback(comments);

  // Calculate response metrics
  const respondedFeedbacks = feedbacks.filter(f => f.creator_response);
  const totalResponses = respondedFeedbacks.length;
  
  const responseTimes = respondedFeedbacks
    .filter(f => f.response_date && f.created_at)
    .map(f => {
      const responseTime = new Date(f.response_date!).getTime() - new Date(f.created_at).getTime();
      return responseTime / (1000 * 60 * 60); // Convert to hours
    });

  const averageResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  const responseRate = totalFeedbacks > 0
    ? (totalResponses / totalFeedbacks) * 100
    : 0;

  return {
    averageRating,
    totalFeedbacks,
    positiveFeedbacks,
    negativeFeedbacks,
    neutralFeedbacks,
    sentimentScore,
    commonIssues,
    improvementSuggestions,
    categories,
    responseMetrics: {
      totalResponses,
      averageResponseTime,
      responseRate,
    },
  };
}

function categorizeFeedback(comments: string[]): { [key: string]: number } {
  const categoryScores: { [key: string]: number } = {};

  FEEDBACK_CATEGORIES.forEach(category => {
    let score = 0;
    comments.forEach(comment => {
      category.keywords.forEach(keyword => {
        if (comment.toLowerCase().includes(keyword)) {
          score += category.weight;
        }
      });
    });
    categoryScores[category.name] = score;
  });

  return categoryScores;
}

function extractCommonIssues(comments: string[]): string[] {
  const issues: string[] = [];
  const issueKeywords = ['error', 'bug', 'issue', 'problem', 'fails', 'doesn\'t work', 'broken'];
  
  comments.forEach(comment => {
    issueKeywords.forEach(keyword => {
      if (comment.toLowerCase().includes(keyword)) {
        issues.push(comment);
      }
    });
  });

  return [...new Set(issues)];
}

function extractImprovementSuggestions(comments: string[]): string[] {
  const suggestions: string[] = [];
  const suggestionKeywords = ['could', 'should', 'would be better', 'suggest', 'recommend', 'improve'];
  
  comments.forEach(comment => {
    suggestionKeywords.forEach(keyword => {
      if (comment.toLowerCase().includes(keyword)) {
        suggestions.push(comment);
      }
    });
  });

  return [...new Set(suggestions)];
}

export async function updateAgentBasedOnFeedback(agentId: string): Promise<void> {
  const metrics = await analyzeFeedback(agentId);
  
  // Get agent details for notification
  const agent = await db
    .select()
    .from(deployments)
    .where(eq(deployments.id, agentId))
    .limit(1);

  if (!agent.length) return;

  const agentDetails = agent[0];
  
  // If sentiment score is low or there are many negative feedbacks, mark for review
  if (metrics.sentimentScore < -0.3 || metrics.negativeFeedbacks > metrics.positiveFeedbacks) {
    await db
      .update(deployments)
      .set({
        status: 'needs_review',
        updated_at: new Date(),
      })
      .where(eq(deployments.id, agentId));

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

export async function getFeedbackTrends(agentId: string, days: number = 30): Promise<{
  date: string;
  averageRating: number;
  feedbackCount: number;
}[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const feedbacks = await db
    .select()
    .from(agentFeedbacks)
    .where(
      and(
        eq(agentFeedbacks.agentId, agentId),
        gte(agentFeedbacks.createdAt, startDate)
      )
    );

  // Group feedbacks by date
  const feedbacksByDate = feedbacks.reduce((acc, feedback) => {
    const date = feedback.createdAt.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        ratings: [],
        count: 0,
      };
    }
    acc[date].ratings.push(feedback.rating);
    acc[date].count++;
    return acc;
  }, {} as Record<string, { ratings: number[]; count: number }>);

  // Calculate daily averages
  return Object.entries(feedbacksByDate).map(([date, data]) => ({
    date,
    averageRating: data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length,
    feedbackCount: data.count,
  }));
} 