import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateStatusSchema = z.object({
  agentId: z.string().uuid(),
  status: z.enum(['pending', 'deploying', 'active', 'failed', 'stopped']),
  apiEndpoint: z.string().url().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { agentId, status, apiEndpoint } = updateStatusSchema.parse(body);

    const agent = await prisma.deployment.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this agent' },
        { status: 403 }
      );
    }

    const updatedAgent = await prisma.deployment.update({
      where: { id: agentId },
      data: {
        status,
        ...(apiEndpoint && { apiEndpoint }),
        updatedAt: new Date(),
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