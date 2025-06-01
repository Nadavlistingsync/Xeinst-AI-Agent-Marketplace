import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/api';
import { z } from 'zod';

const recommendationsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).optional(),
  minConfidence: z.number().min(0).max(1).optional(),
  includeDetails: z.boolean().optional()
});

// Helper function to calculate sentiment
const getSentiment = (rating: number): string => {
  if (rating >= 4) return 'positive';
  if (rating >= 3) return 'neutral';
  return 'negative';
};

// Helper function to generate recommendations based on feedback
const generateRecommendations = (feedback: any[], minConfidence: number = 0.7) => {
  const recommendations: any[] = [];
  const sentimentCounts = feedback.reduce((acc, item) => {
    const sentiment = getSentiment(item.rating);
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalFeedback = feedback.length;
  const sentimentRatios = Object.entries(sentimentCounts).map(([sentiment, count]) => ({
    sentiment,
    ratio: count / totalFeedback
  }));

  // Generate recommendations based on sentiment distribution
  sentimentRatios.forEach(({ sentiment, ratio }) => {
    if (ratio >= minConfidence) {
      let recommendation = '';
      let priority = 'low';

      switch (sentiment) {
        case 'positive':
          if (ratio >= 0.9) {
            recommendation = 'Consider scaling up successful features';
            priority = 'high';
          } else {
            recommendation = 'Maintain current performance and gather more feedback';
            priority = 'medium';
          }
          break;
        case 'neutral':
          if (ratio >= 0.8) {
            recommendation = 'Focus on improving user engagement';
            priority = 'high';
          } else {
            recommendation = 'Monitor user satisfaction trends';
            priority = 'medium';
          }
          break;
        case 'negative':
          if (ratio >= 0.7) {
            recommendation = 'Immediate action required to address user concerns';
            priority = 'high';
          } else {
            recommendation = 'Investigate and address specific pain points';
            priority = 'medium';
          }
          break;
      }

      recommendations.push({
        type: sentiment,
        confidence: ratio,
        priority,
        recommendation,
        metrics: {
          totalFeedback,
          sentimentCount: sentimentCounts[sentiment],
          ratio
        }
      });
    }
  });

  // Generate time-based recommendations
  const recentFeedback = feedback.slice(-10);
  const recentSentiment = getSentiment(
    recentFeedback.reduce((sum, item) => sum + item.rating, 0) / recentFeedback.length
  );

  if (recentFeedback.length >= 5) {
    const trend = recentSentiment === 'positive' ? 'improving' : 
                 recentSentiment === 'negative' ? 'declining' : 'stable';
    
    recommendations.push({
      type: 'trend',
      confidence: 0.8,
      priority: trend === 'declining' ? 'high' : 'medium',
      recommendation: `User satisfaction is ${trend}. ${
        trend === 'declining' ? 'Immediate attention required.' :
        trend === 'improving' ? 'Continue current improvements.' :
        'Monitor for changes in user satisfaction.'
      }`,
      metrics: {
        recentFeedbackCount: recentFeedback.length,
        trend,
        recentSentiment
      }
    });
  }

  return recommendations;
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate agent ID
    if (!z.string().uuid().safeParse(params.id).success) {
      return NextResponse.json(
        { error: 'Invalid agent ID format' },
        { status: 400 }
      );
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            subscription_tier: true
          }
        }
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Check if user has access to the agent
    if (agent.userId !== session.user.id && agent.access_level !== 'public') {
      if (agent.access_level === 'premium' && session.user.subscription_tier !== 'premium') {
        return NextResponse.json(
          { error: 'Premium subscription required' },
          { status: 403 }
        );
      }
      if (agent.access_level === 'basic' && session.user.subscription_tier !== 'basic') {
        return NextResponse.json(
          { error: 'Basic subscription required' },
          { status: 403 }
        );
      }
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      minConfidence: searchParams.get('minConfidence') ? parseFloat(searchParams.get('minConfidence')!) : undefined,
      includeDetails: searchParams.get('includeDetails') === 'true'
    };

    const validatedParams = recommendationsQuerySchema.parse(queryParams);

    // Get feedback entries
    const feedback = await prisma.feedback.findMany({
      where: {
        agentId: params.id,
        ...(validatedParams.startDate && validatedParams.endDate ? {
          createdAt: {
            gte: new Date(validatedParams.startDate),
            lte: new Date(validatedParams.endDate)
          }
        } : {})
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Generate recommendations
    const recommendations = generateRecommendations(
      feedback,
      validatedParams.minConfidence
    );

    // Sort recommendations by priority and confidence
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.confidence - a.confidence;
    });

    // Apply limit if specified
    const limitedRecommendations = validatedParams.limit
      ? recommendations.slice(0, validatedParams.limit)
      : recommendations;

    return NextResponse.json({
      recommendations: limitedRecommendations,
      metadata: {
        agentId: params.id,
        timeRange: {
          start: validatedParams.startDate,
          end: validatedParams.endDate
        },
        totalFeedback: feedback.length,
        totalRecommendations: recommendations.length,
        minConfidence: validatedParams.minConfidence,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    const errorResponse = createErrorResponse(error, 'Failed to generate recommendations');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status }
    );
  }
} 