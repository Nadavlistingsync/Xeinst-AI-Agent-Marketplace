import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { type FeedbackCategory } from '@/types/feedback-analytics';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<{ success: boolean; data?: { categories: FeedbackCategory[] }; error?: string }>> {
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
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    const categories: Record<string, { count: number; examples: any[] }> = {};

    feedback.forEach((f) => {
      const feedbackCategories = f.categories as Record<string, number> | null;
      if (feedbackCategories) {
        Object.entries(feedbackCategories).forEach(([category]) => {
          if (!categories[category]) {
            categories[category] = {
              count: 0,
              examples: [],
            };
          }
          categories[category].count++;
          if (categories[category].examples.length < 3) {
            categories[category].examples.push(f);
          }
        });
      }
    });

    const total = Object.values(categories).reduce((sum, cat) => sum + cat.count, 0);

    const formattedCategories: FeedbackCategory[] = Object.entries(categories).map(
      ([name, data]) => ({
        name,
        count: data.count,
        percentage: (data.count / total) * 100,
        examples: data.examples.map((f) => f.comment || '').filter(Boolean),
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        categories: formattedCategories,
        summary: {
          total,
          uniqueCategories: formattedCategories.length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching feedback categories:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 