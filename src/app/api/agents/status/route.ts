import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateStatusSchema = z.object({
  agentId: z.string().uuid(),
  status: z.enum(['pending', 'deploying', 'active', 'failed', 'stopped']),
  api_endpoint: z.string().url().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { agentId, status, api_endpoint } = updateStatusSchema.parse(body);

    const agent = await prisma.deployments.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.deployed_by !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this agent' },
        { status: 403 }
      );
    }

    const updatedAgent = await prisma.deployments.update({
      where: { id: agentId },
      data: {
        status,
        ...(api_endpoint && { api_endpoint }),
        updated_at: new Date(),
      },
    });

    return NextResponse.json(updatedAgent);
  } catch (error) {
    console.error('Error updating agent status:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 