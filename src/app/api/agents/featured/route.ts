import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

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
  try {
    const featuredAgents = await prisma.product.findMany({
      where: {
        isPublic: true,
        status: 'published'
      },
      orderBy: {
        rating: 'desc'
      },
      take: 6
    });

    // Validate the response data
    const validatedAgents = featuredAgents.map(agent => {
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

    return NextResponse.json({
      agents: validatedAgents,
      count: validatedAgents.length,
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