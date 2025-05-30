import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { startOfDay, subDays } from 'date-fns';

// Simple keyword-based categorization
const categorizeFeedback = (comment: string | null): string => {
  if (!comment) return 'No Comment';
  
  const lowerComment = comment.toLowerCase();
  
  if (lowerComment.includes('bug') || lowerComment.includes('error') || lowerComment.includes('issue')) {
    return 'Bugs & Issues';
  }
  if (lowerComment.includes('slow') || lowerComment.includes('performance') || lowerComment.includes('speed')) {
    return 'Performance';
  }
  if (lowerComment.includes('interface') || lowerComment.includes('ui') || lowerComment.includes('ux')) {
    return 'User Interface';
  }
  if (lowerComment.includes('feature') || lowerComment.includes('request') || lowerComment.includes('suggestion')) {
    return 'Feature Requests';
  }
  if (lowerComment.includes('documentation') || lowerComment.includes('guide') || lowerComment.includes('help')) {
    return 'Documentation';
  }
  
  return 'General Feedback';
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = startOfDay(subDays(new Date(), days));

    const feedbacks = await prisma.agentFeedback.findMany({
      where: {
        agentId: params.id,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        comment: true,
        rating: true,
      },
    });

    // Categorize feedbacks and calculate category scores
    const categories = feedbacks.reduce((acc: Record<string, { count: number; score: number }>, feedback) => {
      const category = categorizeFeedback(feedback.comment);
      
      if (!acc[category]) {
        acc[category] = { count: 0, score: 0 };
      }
      
      acc[category].count++;
      acc[category].score += feedback.rating;
      
      return acc;
    }, {});

    // Convert to array format and calculate average scores
    const categoryData = Object.entries(categories).map(([name, { count, score }]) => ({
      name,
      value: score / count,
      count,
    }));

    // Sort by count (most frequent first)
    categoryData.sort((a, b) => b.count - a.count);

    return NextResponse.json(categoryData);
  } catch (error) {
    console.error('Error fetching feedback categories:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 