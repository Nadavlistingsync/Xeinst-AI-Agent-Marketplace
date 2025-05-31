import { prisma } from './db';
import { AgentFeedback } from '@prisma/client';
import { createNotification } from './notifications';

interface SentimentAnalysis {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
}

interface FeedbackAnalysis {
  totalFeedbacks: number;
  averageRating: number;
  sentimentScore: number;
  positiveFeedbacks: number;
  negativeFeedbacks: number;
  neutralFeedbacks: number;
  categories: Record<string, number>;
  recentTrends: {
    rating: number;
    sentiment: number;
  };
}

function analyzeSentiment(text: string): SentimentAnalysis {
  // Simple sentiment analysis implementation
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'best'];
  const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'hate', 'worst'];
  
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });
  
  const label = score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
  return { score, label };
}

function categorizeFeedback(text: string): string[] {
  const categories = [
    'performance',
    'usability',
    'reliability',
    'features',
    'support',
    'documentation'
  ];
  
  const words = text.toLowerCase().split(/\s+/);
  return categories.filter(category => 
    words.some(word => word.includes(category))
  );
}

export async function analyzeAgentFeedback(deploymentId: string): Promise<FeedbackAnalysis> {
  const feedbacks = await prisma.agentFeedback.findMany({
    where: { deploymentId },
    orderBy: { createdAt: 'desc' }
  });
  
  if (feedbacks.length === 0) {
    return {
      totalFeedbacks: 0,
      averageRating: 0,
      sentimentScore: 0,
      positiveFeedbacks: 0,
      negativeFeedbacks: 0,
      neutralFeedbacks: 0,
      categories: {},
      recentTrends: { rating: 0, sentiment: 0 }
    };
  }
  
  const sentimentAnalyses = await Promise.all(
    feedbacks.map(f => analyzeSentiment(f.comment || ''))
  );
  
  const categoryAnalyses = await Promise.all(
    feedbacks.map(f => categorizeFeedback(f.comment || ''))
  );
  
  const totalSentiment = sentimentAnalyses.reduce((sum, analysis) => sum + analysis.score, 0);
  const averageSentiment = totalSentiment / feedbacks.length;
  
  const sentimentCounts = sentimentAnalyses.reduce((counts, analysis) => {
    counts[analysis.label]++;
    return counts;
  }, { positive: 0, negative: 0, neutral: 0 });
  
  const categoryCounts = categoryAnalyses.reduce((counts, analysis) => {
    Object.entries(analysis).forEach(([category, count]) => {
      counts[category] = (counts[category] || 0) + count;
    });
    return counts;
  }, {} as Record<string, number>);
  
  // Calculate recent trends (last 2 weeks)
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  const recentFeedbacks = feedbacks.filter(f => f.createdAt >= twoWeeksAgo);
  const olderFeedbacks = feedbacks.filter(f => f.createdAt < twoWeeksAgo);
  
  const recentSentiment = recentFeedbacks.reduce((sum, f) => sum + (f.sentimentScore ? Number(f.sentimentScore) : 0), 0) / recentFeedbacks.length;
  const olderSentiment = olderFeedbacks.reduce((sum, f) => sum + (f.sentimentScore ? Number(f.sentimentScore) : 0), 0) / olderFeedbacks.length;
  
  const recentRating = recentFeedbacks.reduce((sum, f) => sum + f.rating, 0) / recentFeedbacks.length;
  const olderRating = olderFeedbacks.reduce((sum, f) => sum + f.rating, 0) / olderFeedbacks.length;
  
  return {
    totalFeedbacks: feedbacks.length,
    averageRating: feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length,
    sentimentScore: averageSentiment,
    positiveFeedbacks: sentimentCounts.positive,
    negativeFeedbacks: sentimentCounts.negative,
    neutralFeedbacks: sentimentCounts.neutral,
    categories: categoryCounts,
    recentTrends: {
      rating: recentRating - olderRating,
      sentiment: recentSentiment - olderSentiment
    }
  };
}

export async function analyzeSentiment(text: string): Promise<SentimentAnalysis> {
  // Simple sentiment analysis based on keyword matching
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'best', 'perfect', 'awesome'];
  const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'hate', 'worst', 'useless', 'disappointing'];
  
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });
  
  const normalizedScore = score / words.length;
  
  return {
    score: normalizedScore,
    label: normalizedScore > 0.1 ? 'positive' : normalizedScore < -0.1 ? 'negative' : 'neutral'
  };
}

export async function categorizeFeedback(text: string): Promise<Record<string, number>> {
  const categories = {
    performance: ['fast', 'slow', 'speed', 'performance', 'efficient', 'lag', 'response'],
    usability: ['easy', 'hard', 'intuitive', 'complicated', 'user-friendly', 'interface'],
    reliability: ['stable', 'crash', 'error', 'reliable', 'unstable', 'bug'],
    features: ['feature', 'functionality', 'capability', 'missing', 'needs'],
    support: ['support', 'help', 'documentation', 'guide', 'tutorial']
  };
  
  const words = text.toLowerCase().split(/\s+/);
  const categoryCounts: Record<string, number> = {};
  
  Object.entries(categories).forEach(([category, keywords]) => {
    categoryCounts[category] = keywords.filter(keyword => words.includes(keyword)).length;
  });
  
  return categoryCounts;
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
        createdAt: {
          gte: timeRange.start,
          lte: timeRange.end
        }
      } : {})
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  const sentimentTrend = await Promise.all(
    feedbacks.map(async feedback => {
      const sentiment = await analyzeSentiment(feedback.comment || '');
      return {
        date: feedback.createdAt.toISOString(),
        score: sentiment.score,
      };
    })
  );

  const categoryTrend = await Promise.all(
    feedbacks.map(async feedback => {
      const categories = await categorizeFeedback(feedback.comment || '');
      return {
        date: feedback.createdAt.toISOString(),
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
      createdAt: {
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

export interface FeedbackAnalysis {
  sentimentScore: number;
  categories: string[];
  positiveFeedback: number;
  negativeFeedback: number;
  totalFeedbacks: number;
  averageRating: number;
  positiveFeedbacks: number;
  negativeFeedbacks: number;
}

export async function analyzeFeedback(agentId: string, timeRange: { start: Date; end: Date }): Promise<FeedbackAnalysis> {
  const feedback = await prisma.agentFeedback.findMany({
    where: {
      agentId,
      createdAt: {
        gte: timeRange.start,
        lte: timeRange.end
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const totalFeedbacks = feedback.length;
  const averageRating = feedback.reduce((sum, f) => sum + f.rating, 0) / (totalFeedbacks || 1);
  const positiveFeedbacks = feedback.filter(f => f.rating >= 4).length;
  const negativeFeedbacks = feedback.filter(f => f.rating <= 2).length;

  const sentimentScore = (positiveFeedbacks - negativeFeedbacks) / (totalFeedbacks || 1);
  const categories = Array.from(new Set(feedback.map(f => f.category).filter(Boolean)));

  return {
    sentimentScore,
    categories,
    positiveFeedback: positiveFeedbacks,
    negativeFeedback: negativeFeedbacks,
    totalFeedbacks,
    averageRating,
    positiveFeedbacks,
    negativeFeedbacks
  };
} 