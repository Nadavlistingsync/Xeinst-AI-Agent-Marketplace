import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      headers: new (global.Headers || function(h) { return h || {}; })(init?.headers || {}),
    })),
  },
}));

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
    const featuredAgents = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.is_public, true),
          eq(products.is_featured, true)
        )
      )
      .orderBy(desc(products.average_rating))
      .limit(6);

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