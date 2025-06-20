import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createErrorResponse } from '@/lib/error-handling';
import { z } from 'zod';

const agentSchema = z.object({
  name: z.string(),
  description: z.string(),
  model: z.string(),
  status: z.enum(['active', 'inactive']),
  metadata: z.record(z.any()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const creator = url.searchParams.get('creator');

    let where: any = {};
    // Only filter by creator if explicitly requested
    if (creator === 'true') {
      // Optionally, you could require auth for this branch only
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      where = { createdBy: session.user.id };
    }

    const agents = await prisma.deployment.findMany({ where });

    // Map to the structure expected by the dashboard
    return NextResponse.json({
      agents: agents.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        downloads: agent.downloadCount ?? 0,
        revenue: 0, // Replace with actual revenue if available
        status: agent.status,
      }))
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
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

    const agent = await (prisma as any).agent.create({
      data: {
        ...validatedData,
        modelType: body.modelType || 'standard',
        createdBy: session.user.id,
        deployedBy: session.user.id,
      },
    });

    return NextResponse.json({
      ...agent,
      createdAt: agent.createdAt.toISOString(),
      updatedAt: agent.updatedAt.toISOString(),
    });
  } catch (error) {
    return createErrorResponse(error);
  }
} 