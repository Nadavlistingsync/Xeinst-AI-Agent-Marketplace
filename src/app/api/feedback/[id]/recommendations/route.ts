import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { type FeedbackRecommendation } from '@/types/feedback';

type Priority = 'high' | 'medium' | 'low';
type RecommendationStatus = 'pending' | 'in_progress' | 'completed';

const priorityOrder: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1
};

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<{ success: boolean; data?: { recommendations: FeedbackRecommendation[] }; error?: string }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      select: {
        createdBy: true,
        accessLevel: true
      }
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.createdBy !== session.user.id && agent.accessLevel !== 'public') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const feedback = await prisma.agentFeedback.findMany({
      where: {
        deploymentId: params.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const categoryFrequencies: Record<string, { count: number; totalRating: number; comments: string[] }> = {};

    feedback.forEach((f) => {
      if (f.categories) {
        const categories = f.categories as Record<string, number>;
        Object.entries(categories).forEach(([category]) => {
          if (!categoryFrequencies[category]) {
            categoryFrequencies[category] = {
              count: 0,
              totalRating: 0,
              comments: [],
            };
          }
          categoryFrequencies[category].count++;
          categoryFrequencies[category].totalRating += f.rating;
          if (f.comment && categoryFrequencies[category].comments.length < 3) {
            categoryFrequencies[category].comments.push(f.comment);
          }
        });
      }
    });

    const totalFeedback = feedback.length;
    const recommendations: FeedbackRecommendation[] = Object.entries(categoryFrequencies)
      .map(([category, data]) => {
        const frequency = data.count / totalFeedback;
        return {
          id: crypto.randomUUID(),
          title: `Improve ${category}`,
          description: `Based on feedback analysis, this area needs attention`,
          priority: frequency > 0.7 ? 'high' : frequency > 0.4 ? 'medium' : 'low' as Priority,
          category,
          impact: Math.round(frequency * 100),
          effort: 50,
          status: 'pending' as RecommendationStatus,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      })
      .sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.impact - a.impact;
      });

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
      },
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 