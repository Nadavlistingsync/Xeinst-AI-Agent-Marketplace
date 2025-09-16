import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { getAgentLogs } from '@/lib/agent-monitoring';
import { createErrorResponse, createSuccessResponse } from '@/lib/api';
import { z } from 'zod';

const logsQuerySchema = z.object({
  level: z.enum(['info', 'warning', 'error']).optional(),
  limit: z.number().min(1).max(1000).default(100),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse(new Error('Unauthorized'));
    }

    const { searchParams } = new URL(request.url);
    const queryParams = {
      level: searchParams.get('level') as 'info' | 'warning' | 'error' | undefined,
      limit: parseInt(searchParams.get('limit') || '100', 10),
    };

    const validatedParams = logsQuerySchema.parse(queryParams);

    const logs = await getAgentLogs(params.id, {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      endDate: new Date(),
      limit: validatedParams.limit,
      level: validatedParams.level,
    });

    return createSuccessResponse(logs);
  } catch (error) {
    console.error('Error fetching agent logs:', error);
    return createErrorResponse(error);
  }
} 