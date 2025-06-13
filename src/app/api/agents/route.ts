import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { agentSchema } from '@/lib/schema';

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Serialize dates to ISO strings
    const serializedAgents = agents.map(agent => ({
      ...agent,
      createdAt: agent.createdAt.toISOString(),
      updatedAt: agent.updatedAt.toISOString(),
    }));

    return NextResponse.json(serializedAgents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = agentSchema.parse(body);

    const agent = await prisma.agent.create({
      data: {
        ...validatedData,
        modelType: body.modelType || 'standard',
        createdBy: session.user.id,
        deployedBy: session.user.id,
      },
    });

    // Serialize dates to ISO strings
    const serializedAgent = {
      ...agent,
      createdAt: agent.createdAt.toISOString(),
      updatedAt: agent.updatedAt.toISOString(),
    };

    return NextResponse.json(serializedAgent);
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
} 