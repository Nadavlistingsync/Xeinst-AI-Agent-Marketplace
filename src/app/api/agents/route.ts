import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { startBackgroundJobs } from '@/lib/background-jobs';
import { createErrorResponse } from '@/lib/api';
import { 
  type AgentApiResponse, 
  type AgentsApiResponse,
  agentQuerySchema,
  type Agent
} from '@/types/agents';
import { z } from 'zod';

// Start background jobs when the module is loaded
startBackgroundJobs();

export async function GET(request: Request): Promise<NextResponse<AgentsApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      status: searchParams.get('status'),
      search: searchParams.get('search'),
    };

    const validatedQuery = agentQuerySchema.parse(query);
    const skip = (validatedQuery.page - 1) * validatedQuery.limit;

    const where = {
      ...(validatedQuery.status && { status: validatedQuery.status }),
      ...(validatedQuery.search && {
        OR: [
          { name: { contains: validatedQuery.search, mode: 'insensitive' } },
          { description: { contains: validatedQuery.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        skip,
        take: validatedQuery.limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.agent.count({ where }),
    ]);

    const formattedAgents = agents.map(agent => ({
      ...agent,
      metadata: {
        isFeatured: agent.metadata?.isFeatured || false,
        isTrending: agent.metadata?.isTrending || false,
        rating: agent.metadata?.rating || 0,
        reviews: agent.metadata?.reviews || 0,
        image: agent.metadata?.image || '/agent-placeholder.png',
      },
    }));

    return NextResponse.json({
      success: true,
      agents: formattedAgents,
      pagination: {
        total,
        pages: Math.ceil(total / validatedQuery.limit),
        currentPage: validatedQuery.page,
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

export async function DELETE(request: Request): Promise<NextResponse<AgentApiResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.findUnique({
      where: { id },
      include: { user: true },
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

    await prisma.agent.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      createErrorResponse(error, 'Failed to delete agent'),
      { status: 500 }
    );
  }
} 