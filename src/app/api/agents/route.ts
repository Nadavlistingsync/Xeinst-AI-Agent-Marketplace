import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { startBackgroundJobs } from '@/lib/background-jobs';
import { db } from '@/lib/db';

// Start background jobs when the module is loaded
startBackgroundJobs();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Prisma.DeploymentWhereInput = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
    };

    const [agents, total] = await Promise.all([
      prisma.deployment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      prisma.deployment.count({ where }),
    ]);

    return NextResponse.json({
      agents,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
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
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.deployed_by !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this agent' },
        { status: 403 }
      );
    }

    await prisma.deployment.delete({
      where: { id: agentId },
    });

    return NextResponse.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function getFeaturedAgents() {
  try {
    const agents = await db.query.deployments.findMany({
      where: (deployments, { eq }) => eq(deployments.status, 'active'),
      orderBy: (deployments, { desc }) => [desc(deployments.download_count)],
      limit: 5
    });
    return agents;
  } catch (error) {
    console.error('Error fetching featured agents:', error);
    return [];
  }
}

export async function getTrendingAgents() {
  try {
    const agents = await db.query.deployments.findMany({
      where: (deployments, { eq }) => eq(deployments.status, 'active'),
      orderBy: (deployments, { desc }) => [desc(deployments.rating)],
      limit: 5
    });
    return agents;
  } catch (error) {
    console.error('Error fetching trending agents:', error);
    return [];
  }
} 