import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const limit = parseInt(searchParams.get('limit') || '10');

    const whereClause: any = {
      userId: session.user.id
    };

    if (agentId) {
      whereClause.agentId = agentId;
    }

    const executions = await prisma.agentExecution.findMany({
      where: whereClause,
      select: {
        id: true,
        agentId: true,
        input: true,
        output: true,
        status: true,
        executionTime: true,
        requestId: true,
        error: true,
        createdAt: true,
        agent: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return NextResponse.json(executions);

  } catch (error) {
    console.error('Error fetching executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch executions' },
      { status: 500 }
    );
  }
}
