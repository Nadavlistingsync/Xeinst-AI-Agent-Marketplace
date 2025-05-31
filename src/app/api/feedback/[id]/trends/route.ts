import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { startOfDay, subDays } from 'date-fns';

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
        created_at: {
          gte: startDate,
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    // Group feedbacks by date and calculate averages
    const trends = feedbacks.reduce((acc: any[], feedback) => {
      const date = feedback.created_at.toISOString().split('T')[0];
      const existing = acc.find(item => item.date === date);
      
      if (existing) {
        existing.average_rating = (existing.average_rating * existing.feedbackCount + feedback.rating) / (existing.feedbackCount + 1);
        existing.feedbackCount++;
      } else {
        acc.push({
          date,
          average_rating: feedback.rating,
          feedbackCount: 1,
        });
      }
      
      return acc;
    }, []);

    return NextResponse.json(trends);
  } catch (error) {
    console.error('Error fetching feedback trends:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 