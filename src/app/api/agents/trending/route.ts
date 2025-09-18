import { NextResponse } from 'next/server';
import { prisma } from "../../../../lib/prisma";
import { z } from 'zod';
import { isDatabaseAvailable, createDatabaseErrorResponse } from "../../../../lib/db-check";

const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.string(),
  framework: z.string(),
  version: z.string(),
  downloadCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  category: z.string(),
  price: z.number(),
});

export async function GET() {
    // Check if database is available
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        createDatabaseErrorResponse(),
        { status: 503 }
      );
    }

  try {
    // Check if we're in build mode or database is not available and return mock data
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL || 
        process.env.NEXT_PHASE === 'phase-production-build' ||
        !process.env.DATABASE_URL) {
      return NextResponse.json({
        agents: [],
        count: 0,
        timestamp: new Date().toISOString(),
        message: 'Database not available during build'
      }, { status: 200 });
    }

    const agents = await prisma.agent.findMany({
      where: {
        status: 'active',
      },
      orderBy: [
        { downloadCount: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 10,
      include: {
        reviews: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Format agents to match expected structure
    const formattedAgents = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      category: agent.category,
      price: agent.price,
      averageRating: agent.reviews.length > 0 
        ? agent.reviews.reduce((acc, review) => acc + review.rating, 0) / agent.reviews.length
        : 0,
      downloadCount: agent.downloadCount || 0,
      creator: agent.creator,
      status: agent.status,
      framework: agent.framework,
      version: agent.version,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      createdBy: agent.createdBy
    }));

    if (formattedAgents.length === 0) {
      return NextResponse.json(
        { 
          agents: [],
          message: 'No trending agents found'
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      agents: formattedAgents,
      count: formattedAgents.length,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching trending agents:', error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('connection') || 
          error.message.includes('connect') ||
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('timeout') ||
          error.message.includes('does not exist') ||
          error.message.includes('relation') ||
          error.message.includes('column') ||
          error.message.includes('DATABASE_URL') ||
          error.message.includes('Validation Error') ||
          error.message.includes('Error validating datasource')) {
        return NextResponse.json(
          { 
            error: 'Database connection error',
            message: 'Please check database configuration',
            timestamp: new Date().toISOString()
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 