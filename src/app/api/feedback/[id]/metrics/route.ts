import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzeFeedback } from '@/lib/feedback-monitoring';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timeRange = { start: new Date(0), end: new Date() };
    const metrics = await analyzeFeedback(params.id, timeRange);
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching feedback metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 