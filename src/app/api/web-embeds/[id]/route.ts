import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateWebEmbedSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  url: z.string().url().optional(),
  embedUrl: z.string().url().optional(),
  type: z.enum(['website', 'application', 'dashboard', 'tool', 'custom']).optional(),
  status: z.enum(['active', 'inactive', 'pending', 'error']).optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  allowFullscreen: z.boolean().optional(),
  allowScripts: z.boolean().optional(),
  sandbox: z.string().optional(),
  allowedDomains: z.array(z.string()).optional(),
  blockedDomains: z.array(z.string()).optional(),
  requireAuth: z.boolean().optional(),
  agentId: z.string().optional(),
  agentConfig: z.any().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const webEmbed = await prisma.webEmbed.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            description: true,
            webhookUrl: true,
          },
        },
      },
    });

    if (!webEmbed) {
      return NextResponse.json({ error: 'Web embed not found' }, { status: 404 });
    }

    // Log view
    await prisma.webEmbedLog.create({
      data: {
        embedId: params.id,
        action: 'view',
        metadata: {
          userAgent: req.headers.get('user-agent'),
          referer: req.headers.get('referer'),
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Update view count
    await prisma.webEmbed.update({
      where: { id: params.id },
      data: {
        viewCount: { increment: 1 },
        lastViewed: new Date(),
      },
    });

    return NextResponse.json(webEmbed);
  } catch (error) {
    console.error('Error fetching web embed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch web embed' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const webEmbed = await prisma.webEmbed.findUnique({
      where: { id: params.id },
    });

    if (!webEmbed) {
      return NextResponse.json({ error: 'Web embed not found' }, { status: 404 });
    }

    if (webEmbed.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = updateWebEmbedSchema.parse(body);

    const updatedWebEmbed = await prisma.webEmbed.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json(updatedWebEmbed);
  } catch (error) {
    console.error('Error updating web embed:', error);
    return NextResponse.json(
      { error: 'Failed to update web embed' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const webEmbed = await prisma.webEmbed.findUnique({
      where: { id: params.id },
    });

    if (!webEmbed) {
      return NextResponse.json({ error: 'Web embed not found' }, { status: 404 });
    }

    if (webEmbed.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.webEmbed.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Web embed deleted successfully' });
  } catch (error) {
    console.error('Error deleting web embed:', error);
    return NextResponse.json(
      { error: 'Failed to delete web embed' },
      { status: 500 }
    );
  }
} 