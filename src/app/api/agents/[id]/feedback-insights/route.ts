import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateFeedbackInsights, analyzeFeedbackTrends } from '@/lib/feedback-analysis';
import { db } from '@/lib/db';
import { deployments } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const agent = await db
      .select()
      .from(deployments)
      .where(eq(deployments.id, params.id))
      .limit(1);

    if (!agent.length) {
      return new NextResponse('Agent not found', { status: 404 });
    }

    // Check if user has access to the agent
    if (agent[0].deployed_by !== session.user.id && agent[0].access_level !== 'public') {
      if (agent[0].access_level === 'premium' && session.user.subscription_tier !== 'premium') {
        return new NextResponse('Forbidden', { status: 403 });
      }
      if (agent[0].access_level === 'basic' && session.user.subscription_tier !== 'basic') {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

    const [insights, trends] = await Promise.all([
      generateFeedbackInsights(params.id),
      analyzeFeedbackTrends(params.id, startDate && endDate ? { start: startDate, end: endDate } : undefined),
    ]);

    return NextResponse.json({
      insights,
      trends,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating feedback insights:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 