import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const exportSchema = z.object({
  format: z.enum(['json', 'csv']).optional().default('json'),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

interface ExportData {
  agent: {
    id: string;
    name: string;
    description: string;
    framework: string;
    version: string;
    createdAt: string;
    updatedAt: string;
  };
  feedback: Array<{
    id: string;
    rating: number;
    comment: string | null;
    sentimentScore: number | null;
    categories: Record<string, number> | null;
    createdAt: string;
    updatedAt: string;
  }>;
  metadata: {
    totalFeedback: number;
    averageRating: number;
    averageSentiment: number;
    exportDate: string;
  };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const validatedParams = exportSchema.parse({
      format: searchParams.get('format'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate')
    });

    const agent = await prisma.deployment.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        description: true,
        framework: true,
        version: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        isPublic: true
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.createdBy !== session.user.id && !agent.isPublic) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const where = {
      agentId: params.id,
      ...(validatedParams.startDate && {
        createdAt: {
          gte: new Date(validatedParams.startDate)
        }
      }),
      ...(validatedParams.endDate && {
        createdAt: {
          lte: new Date(validatedParams.endDate)
        }
      })
    };

    const feedback = await prisma.agentFeedback.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const exportData: ExportData = {
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        framework: agent.framework,
        version: agent.version,
        createdAt: agent.createdAt.toISOString(),
        updatedAt: agent.updatedAt.toISOString()
      },
      feedback: feedback.map((item) => ({
        id: item.id,
        rating: item.rating,
        comment: item.comment,
        sentimentScore: item.sentimentScore ? Number(item.sentimentScore) : null,
        categories: item.categories as Record<string, number> | null,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString()
      })),
      metadata: {
        totalFeedback: feedback.length,
        averageRating: feedback.length > 0
          ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length
          : 0,
        averageSentiment: feedback.length > 0
          ? feedback.reduce((sum, item) => sum + (item.sentimentScore ? Number(item.sentimentScore) : 0), 0) / feedback.length
          : 0,
        exportDate: new Date().toISOString()
      }
    };

    if (validatedParams.format === 'csv') {
      // Convert to CSV format
      const headers = ['ID', 'Rating', 'Comment', 'Sentiment Score', 'Categories', 'Created At', 'Updated At'];
      const rows = exportData.feedback.map(item => [
        item.id,
        item.rating,
        item.comment || '',
        item.sentimentScore?.toString() || '',
        item.categories ? JSON.stringify(item.categories) : '',
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
    }

    return NextResponse.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Error exporting feedback:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 