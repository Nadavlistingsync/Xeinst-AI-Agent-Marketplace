import { NextResponse } from 'next/server';
import { prisma } from "../../../../lib/prisma";
import { z } from 'zod';

const DeploymentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.string(),
  framework: z.string(),
  version: z.string(),
  rating: z.number(),
  totalRatings: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  deployedBy: z.string().nullable(),
});

export async function GET() {
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

    const agents = await prisma.deployment.findMany({
      where: {
        status: 'active',
      },
      orderBy: {
        rating: 'desc',
      },
      take: 10,
    });

    // Validate the response data
    const validatedAgents = agents.map(agent => {
      try {
        return DeploymentSchema.parse(agent);
      } catch (error) {
        console.error('Validation error for agent:', error);
        return null;
      }
    }).filter(Boolean);

    if (validatedAgents.length === 0) {
      return NextResponse.json(
        { 
          agents: [],
          message: 'No trending agents found'
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      agents: validatedAgents,
      count: validatedAgents.length,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching trending agents:', error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('connection')) {
        return NextResponse.json(
          { error: 'Database connection error' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 