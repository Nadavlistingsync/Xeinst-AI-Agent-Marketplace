import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { startBackgroundJobs } from '@/lib/background-jobs';
import { createErrorResponse } from '@/lib/api';
import { 
  type AgentApiResponse, 
  type AgentsApiResponse,
  agentQuerySchema,
  type Agent
} from '@/types/agents';

// Start background jobs when the module is loaded
startBackgroundJobs();

export async function GET(req: Request): Promise<NextResponse<AgentsApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      status: searchParams.get('status'),
      search: searchParams.get('search'),
    };

    const validatedQuery = agentQuerySchema.parse(query);

    const where: Prisma.DeploymentWhereInput = {
      ...(validatedQuery.status && { status: validatedQuery.status }),
      ...(validatedQuery.search && {
        OR: [
          { name: { contains: validatedQuery.search, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: validatedQuery.search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
    };

    const [agents, total] = await Promise.all([
      prisma.deployment.findMany({
        where,
        skip: (validatedQuery.page - 1) * validatedQuery.limit,
        take: validatedQuery.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          metadata: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }) as Promise<Agent[]>,
      prisma.deployment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      agents,
      pagination: {
        total,
        pages: Math.ceil(total / validatedQuery.limit),
        page: validatedQuery.page,
        limit: validatedQuery.limit,
      },
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      createErrorResponse(error, 'Failed to fetch agents'),
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request): Promise<NextResponse<AgentApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('id');

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to delete this agent' },
        { status: 403 }
      );
    }

    await prisma.deployment.delete({
      where: { id: agentId },
    });

    return NextResponse.json({ 
      success: true, 
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        status: agent.status,
        metadata: agent.metadata,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
      }
    });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      createErrorResponse(error, 'Failed to delete agent'),
      { status: 500 }
    );
  }
}

export async function getFeaturedAgents(): Promise<Agent[]> {
  try {
    const agents = await prisma.deployment.findMany({
      where: { status: 'active' },
      orderBy: { downloadCount: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as Agent[];
    return agents;
  } catch (error) {
    console.error('Error fetching featured agents:', error);
    return [];
  }
}

export async function getTrendingAgents(): Promise<Agent[]> {
  try {
    const agents = await prisma.deployment.findMany({
      where: { status: 'active' },
      orderBy: { rating: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as Agent[];
    return agents;
  } catch (error) {
    console.error('Error fetching trending agents:', error);
    return [];
  }
} 