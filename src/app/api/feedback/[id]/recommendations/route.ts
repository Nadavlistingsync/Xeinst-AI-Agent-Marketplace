import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/errors';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  impact: number;
  effort: number;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

type PriorityLevel = 'high' | 'medium' | 'low';
const priorityOrder: Record<PriorityLevel, number> = {
  high: 3,
  medium: 2,
  low: 1
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        framework: true,
        version: true,
        rating: true,
        totalRatings: true,
        requirements: true,
        createdBy: true,
        deployedBy: true,
        createdAt: true,
        updatedAt: true,
        isPublic: true
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.createdBy !== session.user.id && !agent.isPublic) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const feedbacks = await prisma.agentFeedback.findMany({
      where: { deploymentId: params.id },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    });

    // Calculate category frequencies
    const categoryFrequencies: Record<string, number> = {};
    let totalFeedback = 0;

    feedbacks.forEach(feedback => {
      if (feedback.categories && typeof feedback.categories === 'object') {
        const categories = feedback.categories as Record<string, number>;
        Object.entries(categories).forEach(([category, value]) => {
          categoryFrequencies[category] = (categoryFrequencies[category] || 0) + value;
        });
        totalFeedback++;
      }
    });

    // Generate recommendations based on feedback analysis
    const recommendations: Recommendation[] = Object.entries(categoryFrequencies)
      .map(([category, count]) => {
        const ratio = count / totalFeedback;
        const priority: PriorityLevel = ratio > 0.7 ? 'high' : ratio > 0.4 ? 'medium' : 'low';
        const impact = ratio * 100;
        const effort = Math.random() * 50 + 50; // Random effort between 50-100

        return {
          id: `${category}-${Date.now()}`,
          title: `Improve ${category} functionality`,
          description: `Based on user feedback, ${category} needs attention. ${count} out of ${totalFeedback} users mentioned this aspect.`,
          priority,
          category,
          impact,
          effort,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      })
      .sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.impact - a.impact;
      });

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    const errorResponse = error instanceof ApiError ? error : new ApiError('Failed to generate recommendations');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.statusCode }
    );
  }
} 