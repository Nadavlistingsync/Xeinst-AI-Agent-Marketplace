import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { agentSchema } from '@/lib/schema';

export async function GET() {
  try {
    const agents = await prisma.deployment.findMany({
      where: {
        isPublic: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(agents);
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

    const agent = await prisma.deployment.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
        uploadedBy: session.user.id,
      },
    });

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
} 