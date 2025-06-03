import { NextResponse } from 'next/server';
import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as Session;
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: {
            id: true,
            subscription_tier: true,
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (!agent.fileUrl) {
      return NextResponse.json(
        { success: false, error: 'Agent file not found' },
        { status: 404 }
      );
    }

    const user = session.user as { subscription_tier: string } & typeof session.user;
    // Check access level
    const canAccess = () => {
      if (agent.accessLevel === 'public') return true;
      if (agent.accessLevel === 'basic' && user.subscriptionTier === 'basic') return true;
      if (agent.accessLevel === 'premium' && user.subscriptionTier === 'premium') return true;
      return false;
    };

    if (!canAccess()) {
      return NextResponse.json(
        { error: 'Subscription required' },
        { status: 403 }
      );
    }

    // Fetch the agent file
    const response = await fetch(agent.fileUrl);
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 