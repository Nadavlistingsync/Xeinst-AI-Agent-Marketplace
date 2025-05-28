import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('id');

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: agentId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.deployed_by !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to monitor this agent' },
        { status: 403 }
      );
    }

    // TODO: Implement actual health check
    // This could involve:
    // 1. Checking if the agent is responding to requests
    // 2. Monitoring resource usage
    // 3. Checking error rates
    // 4. Validating API endpoints

    const health = {
      status: 'unknown', // Placeholder since agent.status does not exist
      last_checked: new Date().toISOString(),
      is_healthy: false, // Placeholder
      metrics: {
        uptime: '100%', // Placeholder
        response_time: '50ms', // Placeholder
        error_rate: '0%', // Placeholder
      },
    };

    return NextResponse.json({
      agent,
      health,
    });
  } catch (error) {
    console.error('Error monitoring agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 