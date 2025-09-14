import { NextResponse } from 'next/server';
import { prisma } from "../../../../lib/prisma";
import { z } from 'zod';
import { isDatabaseAvailable, createDatabaseErrorResponse } from "../../../lib/db-check";

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
        featuredAgents = await prisma.product.findMany({
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            price: true,
            rating: true,
            downloadCount: true,
            isPublic: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            requirements: true,
            environment: true,
            uploadedBy: true,
            longDescription: true,
            version: true,
            framework: true,
            modelType: true,
            accessLevel: true,
            licenseType: true,
            earningsSplit: true,
            createdBy: true,
            fileUrl: true,
            tags: true
          }
        });
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Add fallback fields before validation
    const featuredAgentsWithFallbacks = featuredAgents.map(agent => ({
      ...agent,
      imageUrl: null,
      totalRatings: 0
    })) as any[];

    // Validate the response data
    const validatedAgents = featuredAgentsWithFallbacks.map(agent => {
      try {
        return ProductSchema.parse(agent);
      } catch (error) {
        console.error('Validation error for agent:', error);
        return null;
      }
    }).filter(Boolean);

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