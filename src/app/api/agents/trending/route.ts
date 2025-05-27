import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  tag: z.string(),
  price: z.number().nullable(),
  image_url: z.string().nullable(),
  average_rating: z.number(),
  total_ratings: z.number(),
  download_count: z.number(),
  is_public: z.boolean(),
  is_featured: z.boolean(),
  created_at: z.date(),
});

export async function GET() {
  try {
    const trendingAgents = await db
      .select()
      .from(products)
      .where(eq(products.is_public, true))
      .orderBy(desc(products.download_count))
      .limit(6);

    // Validate the response data
    const validatedAgents = trendingAgents.map(agent => {
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
    });
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