import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAgentLogs } from '@/lib/agent-monitoring';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
    });

    if (!agent) {
      return new NextResponse('Agent not found', { status: 404 });
    }

    // Check if user has access to the agent
    if (agent.deployed_by !== session.user.id && agent.access_level !== 'public') {
      if (agent.access_level === 'premium' && session.user.subscription_tier !== 'premium') {
        return new NextResponse('Forbidden', { status: 403 });
      }
      if (agent.access_level === 'basic' && session.user.subscription_tier !== 'basic') {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') as 'info' | 'warning' | 'error' | undefined;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const logs = await getAgentLogs(params.id, {
      level,
      startDate,
      endDate,
      limit,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching agent logs:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 