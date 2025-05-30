import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAgentVersions } from '@/lib/agent-deployment';
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

    // Only the owner can see version history
    if (agent.deployed_by !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const versions = await getAgentVersions(params.id);
    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching agent versions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 