import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: params.agentId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Calculate average rating
    const avgRating = agent.reviews.length > 0 
      ? agent.reviews.reduce((sum, review) => sum + review.rating, 0) / agent.reviews.length
      : 0;

    return NextResponse.json({
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        category: agent.category,
        price: agent.price,
        webhookUrl: agent.webhookUrl,
        config: agent.config,
        version: agent.version,
        status: agent.status,
        downloadCount: agent.downloadCount,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
        creator: agent.creator,
        reviews: agent.reviews,
        averageRating: avgRating,
        totalReviews: agent.reviews.length
      }
    });

  } catch (error) {
    console.error('Get agent error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
