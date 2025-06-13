import { prisma } from '@/types/prisma';
import { AgentFeedback } from '@prisma/client';

export interface SentimentAnalysisResult {
  score: number;
  label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export async function analyzeSentiment(_text: string): Promise<SentimentAnalysisResult> {
  // TODO: Implement actual sentiment analysis
  const score = Math.random() * 2 - 1; // Random score between -1 and 1
  let label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

  if (score > 0.3) {
    label = 'POSITIVE';
  } else if (score < -0.3) {
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