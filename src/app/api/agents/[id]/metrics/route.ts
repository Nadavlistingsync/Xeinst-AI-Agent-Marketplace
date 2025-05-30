import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAgentMetrics } from '@/lib/agent-monitoring';
import prisma from '@/lib/prisma';

export async function GET(
  _request: Request,
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

    const metrics = await getAgentMetrics(params.id);
    if (!metrics) {
      return new NextResponse('Metrics not found', { status: 404 });
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching agent metrics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 