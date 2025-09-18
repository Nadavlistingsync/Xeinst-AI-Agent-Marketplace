import { NextResponse } from 'next/server';
import { prisma } from "../../../../lib/prisma";
import { z } from 'zod';
import { isDatabaseAvailable, createDatabaseErrorResponse } from "../../../../lib/db-check";

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.number(),
  imageUrl: z.string().nullable(),
  rating: z.number(),
  totalRatings: z.number(),
  downloadCount: z.number(),
  isPublic: z.boolean(),
  status: z.enum(['draft', 'published', 'archived']),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.string(),
  environment: z.string(),
  framework: z.string(),
  modelType: z.string(),
  accessLevel: z.enum(['public', 'private', 'restricted']),
  licenseType: z.enum(['free', 'commercial', 'enterprise']),
  earningsSplit: z.number(),
  createdBy: z.string(),
  fileUrl: z.string(),
  requirements: z.array(z.string()),
  tags: z.array(z.string()),
  longDescription: z.string().nullable()
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
    // Add retry logic for database connection
    let retries = 3;
    let featuredAgents: any[] = [];

    while (retries > 0) {
      try {
        featuredAgents = await prisma.agent.findMany({
          take: 6,
          where: {
            status: 'active'
          },
          orderBy: [
            { downloadCount: 'desc' },
            { createdAt: 'desc' }
          ],
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
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Format agents to match expected structure
    const formattedAgents = featuredAgents.map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      category: agent.category,
      price: agent.price,
      averageRating: agent.reviews.length > 0 
        ? agent.reviews.reduce((acc, review) => acc + review.rating, 0) / agent.reviews.length
        : 0,
      downloadCount: agent.downloadCount || 0,
      creator: agent.creator
    }));

    const validatedAgents = formattedAgents;

    if (validatedAgents.length === 0) {
      return NextResponse.json(
        { 
          agents: [],
          message: 'No featured agents found'
        },
        { status: 200 }
      );
    }

    // No need to add fallback fields after validation
    const processedAgents = validatedAgents;

    return NextResponse.json({
      agents: processedAgents,
      count: processedAgents.length,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching featured agents:', error);
    
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