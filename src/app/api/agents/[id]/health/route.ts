import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAgentHealth } from '@/lib/agent-monitoring';
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
    if (
      agent.deployed_by !== session.user.id &&
      agent.access_level !== 'public' &&
      (agent.access_level === 'premium' && session.user.subscription_tier !== 'premium') &&
      (agent.access_level === 'basic' && session.user.subscription_tier !== 'basic')
    ) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const health = await getAgentHealth(params.id);
    return NextResponse.json(health);
  } catch (error) {
    console.error('Error fetching agent health:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 