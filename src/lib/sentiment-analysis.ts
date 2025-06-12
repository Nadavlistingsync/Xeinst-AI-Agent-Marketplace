import { prisma } from '@/types/prisma';

export interface SentimentAnalysisResult {
  score: number;
  label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export async function analyzeSentiment(_text: string): Promise<SentimentAnalysisResult> {
  // TODO: Implement actual sentiment analysis
  const score = Math.random() * 2 - 1; // Random score between -1 and 1
  const label = score > 0.3 ? 'POSITIVE' : score < -0.3 ? 'NEGATIVE' : 'NEUTRAL';
  return { score, label };
}

export async function saveSentimentAnalysis(
  userId: string,
  content: string,
  sentiment: SentimentAnalysisResult
) {
  return prisma.agentFeedback.create({
    data: {
      userId,
      comment: content,
      sentimentScore: sentiment.score,
      metadata: {
        sentiment: sentiment.label,
      },
    },
  });
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