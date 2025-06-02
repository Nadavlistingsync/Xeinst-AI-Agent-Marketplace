import { prisma } from './db';
import { Prisma } from '@prisma/client';
import { AgentFeedback } from './schema';
import { createNotification } from './notifications';

export interface SentimentAnalysis {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface FeedbackAnalysis {
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
    average: number;
  };
  categories: Record<string, number>;
  trends: {
    sentiment: number;
    volume: number;
  };
  sentiment_score: number;
  positive_feedback: number;
  negative_feedback: number;
  total_feedbacks: number;
  average_rating: number;
  positive_feedbacks: number;
  negative_feedbacks: number;
}

export async function analyzeSentiment(text: string): Promise<SentimentAnalysis> {
  // Simple sentiment analysis implementation
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'best', 'perfect', 'awesome'];
  const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'hate', 'worst', 'useless', 'disappointing'];

  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });

  const total = words.length;
  const score = (positiveCount - negativeCount) / total;
  const confidence = Math.abs(score);

  return {
    score,
    label: score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral',
    confidence,
  };
}

export async function categorizeFeedback(text: string): Promise<Record<string, number>> {
  const categories = {
    performance: ['slow', 'fast', 'performance', 'speed', 'efficient', 'lag', 'responsive'],
    reliability: ['stable', 'reliable', 'crash', 'error', 'bug', 'issue', 'problem'],
    usability: ['easy', 'difficult', 'intuitive', 'complicated', 'user-friendly', 'confusing'],
    features: ['feature', 'functionality', 'capability', 'option', 'tool', 'missing'],
    support: ['support', 'help', 'documentation', 'guide', 'tutorial', 'assistance'],
  };

  const words = text.toLowerCase().split(/\s+/);
  const scores: Record<string, number> = {};

  Object.entries(categories).forEach(([category, keywords]) => {
    scores[category] = keywords.reduce((count, keyword) => {
      return count + (words.includes(keyword) ? 1 : 0);
    }, 0);
  });

  return scores;
}

export async function analyzeAgentFeedback(
  feedbacks: AgentFeedback[]
): Promise<FeedbackAnalysis> {
  const sentimentScores = await Promise.all(
    feedbacks.map(async feedback => {
      if (!feedback.comment) return 0;
      const analysis = await analyzeSentiment(feedback.comment);
      return analysis.score;
    })
  );

  const categoryScores = await Promise.all(
    feedbacks.map(async feedback => {
      if (!feedback.comment) return {};
      return await categorizeFeedback(feedback.comment);
    })
  );

  const sentiment = {
    positive: sentimentScores.filter(score => score > 0.1).length,
    negative: sentimentScores.filter(score => score < -0.1).length,
    neutral: sentimentScores.filter(score => score >= -0.1 && score <= 0.1).length,
    average: sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length,
  };

  const categories = categoryScores.reduce((acc, scores) => {
    Object.entries(scores).forEach(([category, count]) => {
      acc[category] = (acc[category] || 0) + count;
    });
    return acc;
  }, {} as Record<string, number>);

  const trends = {
    sentiment: sentiment.average,
    volume: feedbacks.length,
  };

  const totalFeedbacks = feedbacks.length;
  const average_rating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / (totalFeedbacks || 1);
  const positiveFeedbacks = feedbacks.filter(f => f.rating >= 4).length;
  const negativeFeedbacks = feedbacks.filter(f => f.rating <= 2).length;

  const sentimentScore = (positiveFeedbacks - negativeFeedbacks) / (totalFeedbacks || 1);

  return {
    sentiment,
    categories,
    trends,
    sentiment_score: sentimentScore,
    positive_feedback: positiveFeedbacks,
    negative_feedback: negativeFeedbacks,
    total_feedbacks: totalFeedbacks,
    average_rating: average_rating,
    positive_feedbacks: positiveFeedbacks,
    negative_feedbacks: negativeFeedbacks
  };
}

export async function getFeedbackAnalysis(deploymentId: string): Promise<FeedbackAnalysis> {
  const feedbacks = await prisma.agentFeedback.findMany({
    where: { deploymentId },
    orderBy: { created_at: 'desc' },
  });

  return await analyzeAgentFeedback(feedbacks);
}

export async function updateFeedbackAnalysis(
  feedbackId: string,
  analysis: {
    sentimentScore: number;
    categories: Record<string, number>;
  }
): Promise<void> {
  await prisma.agentFeedback.update({
    where: { id: feedbackId },
    data: {
      sentimentScore: analysis.sentimentScore,
      categories: analysis.categories,
    },
  });
}

export async function analyzeFeedbackTrends(
  agentId: string,
  timeRange?: { start: Date; end: Date }
): Promise<{
  sentimentTrend: { date: string; score: number }[];
  categoryTrend: { date: string; categories: { [key: string]: number } }[];
}> {
  const feedbacks = await prisma.agentFeedback.findMany({
    where: {
      agentId,
      ...(timeRange ? {
        created_at: {
          gte: timeRange.start,
          lte: timeRange.end
        }
      } : {})
    },
    orderBy: {
      created_at: 'asc'
    }
  });

  const sentimentTrend = await Promise.all(
    feedbacks.map(async feedback => {
      const sentiment = await analyzeSentiment(feedback.comment || '');
      return {
        date: feedback.created_at.toISOString(),
        score: sentiment.score,
      };
    })
  );

  const categoryTrend = await Promise.all(
    feedbacks.map(async feedback => {
      const categories = await categorizeFeedback(feedback.comment || '');
      return {
        date: feedback.created_at.toISOString(),
        categories,
      };
    })
  );

  return {
    sentimentTrend,
    categoryTrend,
  };
}

export async function generateFeedbackInsights(agentId: string): Promise<{
  topIssues: string[];
  improvementAreas: string[];
  sentimentSummary: {
    overall: number;
    trend: 'improving' | 'declining' | 'stable';
  };
}> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const feedbacks = await prisma.agentFeedback.findMany({
    where: {
      agentId,
      created_at: {
        gte: thirtyDaysAgo
      }
    }
  });

  // Analyze sentiment trends
  const sentiments = await Promise.all(
    feedbacks.map(f => analyzeSentiment(f.comment || ''))
  );
  
  const overallSentiment = sentiments.reduce((acc, curr) => acc + curr.score, 0) / sentiments.length;
  
  // Determine trend
  const recentSentiments = sentiments.slice(-5);
  const recentAverage = recentSentiments.reduce((acc, curr) => acc + curr.score, 0) / recentSentiments.length;
  const trend = recentAverage > overallSentiment ? 'improving' : recentAverage < overallSentiment ? 'declining' : 'stable';

  // Extract common issues and improvement areas
  const allCategories = await Promise.all(
    feedbacks.map(f => categorizeFeedback(f.comment || ''))
  );

  const categoryCounts: { [key: string]: number } = {};
  allCategories.forEach(cats => {
    Object.entries(cats).forEach(([cat, score]) => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + score;
    });
  });

  const sortedCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([name]) => name);

  return {
    topIssues: sortedCategories.slice(0, 3),
    improvementAreas: sortedCategories.slice(-3),
    sentimentSummary: {
      overall: overallSentiment,
      trend,
    },
  };
}

export async function analyzeFeedback(agentId: string, timeRange: { start: Date; end: Date }): Promise<FeedbackAnalysis> {
  const feedback = await prisma.agentFeedback.findMany({
    where: {
      agentId,
      created_at: {
        gte: timeRange.start,
        lte: timeRange.end
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  const totalFeedbacks = feedback.length;
  const average_rating = feedback.reduce((sum, f) => sum + f.rating, 0) / (totalFeedbacks || 1);
  const positiveFeedbacks = feedback.filter(f => f.rating >= 4).length;
  const negativeFeedbacks = feedback.filter(f => f.rating <= 2).length;

  const sentimentScore = (positiveFeedbacks - negativeFeedbacks) / (totalFeedbacks || 1);
  const categories = Array.from(new Set(feedback.map(f => f.category).filter(Boolean)));

  return {
    sentiment_score: sentimentScore,
    categories,
    positive_feedback: positiveFeedbacks,
    negative_feedback: negativeFeedbacks,
    total_feedbacks: totalFeedbacks,
    average_rating: average_rating,
    positive_feedbacks: positiveFeedbacks,
    negative_feedbacks: negativeFeedbacks
  };
} 