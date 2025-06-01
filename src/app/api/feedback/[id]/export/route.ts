import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/api';
import { z } from 'zod';

const exportQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  format: z.enum(['csv', 'json']).default('csv'),
  includeMetadata: z.boolean().optional()
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

    // Check if user has access to the agent
    if (agent.userId !== session.user.id && agent.access_level !== 'public') {
      if (agent.access_level === 'premium' && session.user.subscription_tier !== 'premium') {
        return NextResponse.json(
          { error: 'Premium subscription required' },
          { status: 403 }
        );
      }
      if (agent.access_level === 'basic' && session.user.subscription_tier !== 'basic') {
        return NextResponse.json(
          { error: 'Basic subscription required' },
          { status: 403 }
        );
      }
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      format: searchParams.get('format') as 'csv' | 'json' | null,
      includeMetadata: searchParams.get('includeMetadata') === 'true'
    };

    const validatedParams = exportQuerySchema.parse(queryParams);

    // Get feedback entries
    const feedback = await prisma.feedback.findMany({
      where: {
        agentId: params.id,
        ...(validatedParams.startDate && validatedParams.endDate ? {
          createdAt: {
            gte: new Date(validatedParams.startDate),
            lte: new Date(validatedParams.endDate)
          }
        } : {})
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Prepare export data
    const exportData = feedback.map(item => ({
      id: item.id,
      rating: item.rating,
      comment: item.comment,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }));

    // Add metadata if requested
    const metadata = validatedParams.includeMetadata ? {
      agentId: params.id,
      timeRange: {
        start: validatedParams.startDate,
        end: validatedParams.endDate
      },
      totalFeedback: feedback.length,
      exportDate: new Date().toISOString(),
      format: validatedParams.format
    } : undefined;

    // Generate response based on format
    if (validatedParams.format === 'csv') {
      const headers = ['ID', 'Rating', 'Comment', 'Created At', 'Updated At'];
      const rows = exportData.map(item => [
        item.id,
        item.rating,
        item.comment,
        item.createdAt,
        item.updatedAt
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="feedback-export-${params.id}.csv"`
        }
      });
    } else {
      return NextResponse.json({
        data: exportData,
        ...(metadata && { metadata })
      });
    }
  } catch (error) {
    console.error('Error exporting feedback:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    const errorResponse = createErrorResponse(error, 'Failed to export feedback');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status }
    );
  }
} 