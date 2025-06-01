import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAgentVersions } from '@/lib/agent-deployment';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/api';
import { z } from 'zod';

const versionsQuerySchema = z.object({
  limit: z.number().min(1).max(50).optional(),
  offset: z.number().min(0).optional(),
  includeMetadata: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate agent ID
    if (!z.string().uuid().safeParse(params.id).success) {
      return NextResponse.json(
        { error: 'Invalid agent ID format' },
        { status: 400 }
      );
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            subscription_tier: true
          }
        }
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Only the owner can see version history
    if (agent.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to view version history' },
        { status: 403 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
      includeMetadata: searchParams.get('includeMetadata') === 'true'
    };

    const validatedParams = versionsQuerySchema.parse(queryParams);

    const versions = await getAgentVersions(params.id, validatedParams);
    if (!versions || versions.length === 0) {
      return NextResponse.json(
        { error: 'No versions found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      versions,
      metadata: {
        agentId: params.id,
        totalVersions: versions.length,
        currentVersion: versions[0].version,
        pagination: {
          limit: validatedParams.limit,
          offset: validatedParams.offset
        }
      }
    });
  } catch (error) {
    console.error('Error fetching agent versions:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    const errorResponse = createErrorResponse(error, 'Failed to fetch agent versions');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status }
    );
  }
} 