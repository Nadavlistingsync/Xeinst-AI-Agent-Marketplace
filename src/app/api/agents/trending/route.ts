import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  tag: z.string(),
  price: z.number().nullable(),
  imageUrl: z.string().nullable(),
  rating: z.number(),
  totalRatings: z.number(),
  downloadCount: z.number(),
  isPublic: z.boolean(),
  isFeatured: z.boolean(),
  createdAt: z.date(),
});

export async function GET() {
  try {
    const agents = await prisma.deployment.findMany({
      where: {
        status: 'active',
      },
      orderBy: {
        downloadCount: 'desc',
      },
      take: 10,
    });

    // Validate the response data
    const validatedAgents = agents.map(agent => {
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