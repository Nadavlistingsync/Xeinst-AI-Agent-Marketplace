import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAgentVersions } from '@/lib/agent-deployment';
import { prisma } from '@/lib/prisma';
import { createErrorResponse, createSuccessResponse } from '@/lib/api';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

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
      return createErrorResponse(new Error('Unauthorized'));
    }

    // Validate agent ID
    if (!z.string().uuid().safeParse(params.id).success) {
      return createErrorResponse(new Error('Invalid agent ID format'));
    }

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        createdBy: true,
        status: true,
        name: true,
        description: true,
        framework: true,
        modelType: true,
        accessLevel: true,
        licenseType: true,
        environment: true,
        source: true,
        rating: true,
        totalRatings: true,
        downloadCount: true,
        startDate: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!agent) {
      return createErrorResponse(new Error('Agent not found'));
    }

    // Only the owner can see version history
    if (agent.createdBy !== session.user.id) {
      return createErrorResponse(new Error('Not authorized to view version history'));
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
      includeMetadata: searchParams.get('includeMetadata') === 'true'
    };

    const validatedParams = versionsQuerySchema.parse(queryParams);

    const versions = await getAgentVersions(params.id);
    if (!versions || versions.length === 0) {
      return createErrorResponse(new Error('No versions found'));
    }

    return createSuccessResponse({
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
    return createErrorResponse(error);
  }
} 