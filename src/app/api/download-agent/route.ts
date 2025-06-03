import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { join } from 'path';
import { readFile } from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentId } = await req.json();
    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: agentId }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (agent.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // TODO: Implement file download logic based on your storage solution
    // For now, return a placeholder response
    return NextResponse.json({ 
      message: 'File download not implemented yet',
      agent: {
        id: agent.id,
        name: agent.name,
        framework: agent.framework,
        version: agent.version
      }
    });
  } catch (error) {
    console.error('Error downloading agent:', error);
    return NextResponse.json(
      { error: 'Failed to download agent' },
      { status: 500 }
    );
  }
} 