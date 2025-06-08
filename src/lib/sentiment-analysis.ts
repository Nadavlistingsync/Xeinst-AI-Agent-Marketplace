import { prisma } from './db';
import type { AgentFeedback } from '@/types/prisma';

interface SentimentAnalysisResult {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

interface FeedbackWithSentiment extends Omit<AgentFeedback, 'sentimentScore'> {
  sentimentScore: number;
}

export async function analyzeSentiment(text: string): Promise<SentimentAnalysisResult> {
  // This is a placeholder for actual sentiment analysis implementation
  // In a real implementation, you would use a sentiment analysis API or library
  const score = Math.random() * 2 - 1; // Random score between -1 and 1
  const confidence = Math.random(); // Random confidence between 0 and 1
  const label = score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral';

  return {
    score,
    label,
    confidence
  };
}

export async function getFeedbackWithSentiment(feedbackId: string): Promise<FeedbackWithSentiment | null> {
  return prisma.agentFeedback.findUnique({
    where: {
      id: feedbackId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      deployment: true
    }
  }).then(feedback => feedback ? { ...feedback, sentimentScore: Number(feedback.sentimentScore) } : null);
}

export async function getAverageSentiment(deploymentId: string): Promise<number> {
  const result = await prisma.agentFeedback.aggregate({
    where: {
      deploymentId
    },
    _avg: {
      sentimentScore: true
    }
  });
  return result._avg.sentimentScore ? Number(result._avg.sentimentScore) : 0;
}

export async function getSentimentDistribution(deploymentId: string): Promise<{
  positive: number;
  negative: number;
  neutral: number;
}> {
  const feedback = await prisma.agentFeedback.findMany({
    where: {
      deploymentId
    },
    select: {
      sentimentScore: true
    }
  });

  const distribution = {
    positive: 0,
    negative: 0,
    neutral: 0
  };

  feedback.forEach(f => {
    const score = Number(f.sentimentScore);
    if (score > 0.2) distribution.positive++;
    else if (score < -0.2) distribution.negative++;
    else distribution.neutral++;
  });

  return distribution;
} 