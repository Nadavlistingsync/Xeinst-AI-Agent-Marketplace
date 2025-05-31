import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzeFeedback } from '@/lib/feedback-monitoring';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const metrics = await analyzeFeedback(params.id);
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching feedback metrics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 