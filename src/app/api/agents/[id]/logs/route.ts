import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAgentLogs } from '@/lib/agent-monitoring';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') as 'info' | 'warning' | 'error' | undefined;
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const logs = await getAgentLogs(params.id, {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      endDate: new Date(),
      limit,
      level
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching agent logs:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 