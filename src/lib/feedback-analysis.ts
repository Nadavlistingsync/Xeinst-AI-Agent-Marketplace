import { db } from '@/lib/db';
import { agentFeedbacks } from '@/lib/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { createNotification } from './notifications';

interface SentimentAnalysis {
  score: number; // -1 to 1
  magnitude: number; // 0 to 1
  categories: {
    positive: string[];
    negative: string[];
    neutral: string[];
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

export async function analyzeSentiment(text: string): Promise<SentimentAnalysis> {
  // Simple sentiment analysis based on keyword matching
  const words = text.toLowerCase().split(/\s+/);
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'awesome', 'love', 'perfect', 'best', 'helpful', 'useful'];
  const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'hate', 'worst', 'useless', 'broken', 'wrong', 'problem'];

  let positiveCount = 0;
  let negativeCount = 0;
  let totalWords = words.length;

  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });

  const score = (positiveCount - negativeCount) / totalWords;
  const magnitude = Math.abs(score);

  // Categorize words
  const categories = {
    positive: words.filter(word => positiveWords.includes(word)),
    negative: words.filter(word => negativeWords.includes(word)),
    neutral: words.filter(word => !positiveWords.includes(word) && !negativeWords.includes(word)),
  };

  return {
    score,
    magnitude,
    categories,
  };
}

export async function categorizeFeedback(text: string): Promise<{ [key: string]: number }> {
  const words = text.toLowerCase().split(/\s+/);
  const categories: { [key: string]: number } = {};

  FEEDBACK_CATEGORIES.forEach(category => {
    let score = 0;
    category.keywords.forEach(keyword => {
      if (words.includes(keyword)) {
        score += category.weight;
      }
    });
    if (score > 0) {
      categories[category.name] = score;
    }
  });

  return categories;
}

export async function analyzeFeedbackTrends(agentId: string, timeRange?: { start: Date; end: Date }): Promise<{
  sentimentTrend: { date: string; score: number }[];
  categoryTrend: { date: string; categories: { [key: string]: number } }[];
}> {
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
    .where(whereClause)
    .orderBy(agentFeedbacks.createdAt);

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

  const feedbacks = await db
    .select()
    .from(agentFeedbacks)
    .where(
      and(
        eq(agentFeedbacks.agentId, agentId),
        gte(agentFeedbacks.createdAt, thirtyDaysAgo)
      )
    );

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