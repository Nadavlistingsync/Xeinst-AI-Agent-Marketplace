import { prisma } from '@/types/prisma';
import { AgentFeedback } from '@prisma/client';

export interface SentimentAnalysisResult {
  score: number;
  label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export async function analyzeSentiment(text: string): Promise<SentimentAnalysisResult> {
  // Simple sentiment analysis based on keyword matching
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome',
    'love', 'like', 'enjoy', 'happy', 'satisfied', 'pleased', 'perfect', 'best',
    'outstanding', 'brilliant', 'superb', 'terrific', 'fabulous', 'incredible'
  ];
  
  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'disgusting', 'hate', 'dislike',
    'worst', 'poor', 'disappointing', 'frustrated', 'angry', 'upset', 'sad',
    'awful', 'dreadful', 'atrocious', 'abysmal', 'lousy', 'miserable'
  ];

  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach(word => {
    if (positiveWords.includes(word)) {
      positiveCount++;
    } else if (negativeWords.includes(word)) {
      negativeCount++;
    }
  });

  const totalWords = words.length;
  const positiveRatio = positiveCount / totalWords;
  const negativeRatio = negativeCount / totalWords;
  
  const score = positiveRatio - negativeRatio;
  
  let label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  
  if (score > 0.1) {
    label = 'POSITIVE';
  } else if (score < -0.1) {
    label = 'NEGATIVE';
  } else {
    label = 'NEUTRAL';
  }

  return { score, label };
}

export async function saveSentimentAnalysis(
  userId: string,
  deploymentId: string,
  comment: string,
  sentimentResult: SentimentAnalysisResult
): Promise<AgentFeedback> {
  return prisma.agentFeedback.create({
    data: {
      userId,
      deploymentId,
      comment,
      rating: Math.round((sentimentResult.score + 1) * 2.5), // Convert -1 to 1 scale to 1-5 scale
      sentimentScore: sentimentResult.score,
      metadata: {
        sentiment: sentimentResult.label,
      },
    },
  });
}

export async function getSentimentAnalysis(feedbackId: string): Promise<SentimentAnalysisResult | null> {
  const feedback = await prisma.agentFeedback.findUnique({
    where: { id: feedbackId },
    select: {
      sentimentScore: true,
      metadata: true,
    },
  });

  if (!feedback || typeof feedback.sentimentScore !== 'number' || !feedback.metadata || typeof feedback.metadata !== 'object') {
    return null;
  }

  const label = (feedback.metadata as any).sentiment;
  if (label !== 'POSITIVE' && label !== 'NEGATIVE' && label !== 'NEUTRAL') {
    return null;
  }

  return {
    score: feedback.sentimentScore,
    label,
  };
}

export async function getSentimentHistory(userId: string) {
  return prisma.agentFeedback.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAverageSentiment(userId: string): Promise<number> {
  const feedback = await prisma.agentFeedback.findMany({
    where: { userId },
    select: { sentimentScore: true },
  });

  if (feedback.length === 0) {
    return 0;
  }

  const totalSentiment = feedback.reduce((sum, f) => sum + (f.sentimentScore || 0), 0);
  return totalSentiment / feedback.length;
} 