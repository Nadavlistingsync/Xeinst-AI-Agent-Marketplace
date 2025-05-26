import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

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
      .orderBy(products.created_at)
      .limit(5);

    return NextResponse.json({ agents: featuredAgents });
  } catch (error) {
    console.error('Error fetching featured agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured agents' },
      { status: 500 }
    );
  }
} 