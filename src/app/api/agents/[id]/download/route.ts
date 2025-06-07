import { NextResponse } from 'next/server';
import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createErrorResponse } from '@/lib/api';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions) as Session;
    if (!session?.user) {
      return createErrorResponse(new Error('Unauthorized'));
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            subscriptionTier: true,
          },
        },
      },
    });

    if (!agent) {
      return createErrorResponse(new Error('Agent not found'));
    }

    if (!agent.source) {
      return createErrorResponse(new Error('Agent source not found'));
    }

    const user = session.user as { subscriptionTier: string } & typeof session.user;
    // Check access level
    const canAccess = () => {
      if (agent.accessLevel === 'public') return true;
      if (agent.accessLevel === 'basic' && user.subscriptionTier === 'basic') return true;
      if (agent.accessLevel === 'premium' && user.subscriptionTier === 'premium') return true;
      return false;
    };

    if (!canAccess()) {
      return createErrorResponse(new Error('Subscription required'));
    }

    // Fetch the agent file
    const response = await fetch(agent.source);
    if (!response.ok) {
      throw new Error('Failed to fetch agent file');
    }

    const blob = await response.blob();

    // Update download count
    await prisma.deployment.update({
      where: { id: params.id },
      data: {
        downloadCount: {
          increment: 1
        }
      }
    });

    // Return the file
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${agent.name}.zip"`,
      },
    });
  } catch (error) {
    console.error('Error downloading agent:', error);
    return createErrorResponse(error);
  }
} 