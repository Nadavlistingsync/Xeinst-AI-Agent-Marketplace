import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { products } from '@/lib/schema';
import { eq, and, gte, lte, ilike, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('minRating');
    const sortBy = searchParams.get('sortBy') || 'newest';

    const conditions = [eq(products.is_public, true)];

    // Apply text search
    if (query) {
      const orCondition = or(
        ilike(products.name, `%${query}%`),
        ilike(products.description, `%${query}%`),
        ilike(products.category, `%${query}%`)
      );
      if (orCondition) {
        conditions.push(orCondition);
      }
    }

    // Apply category filter
    if (category && category !== 'All') {
      conditions.push(eq(products.category, category));
    }

    // Apply price filters
    if (minPrice) {
      conditions.push(gte(products.price, minPrice));
    }
    if (maxPrice) {
      conditions.push(lte(products.price, maxPrice));
    }

    // Apply rating filter
    if (minRating) {
      conditions.push(gte(products.average_rating, minRating));
    }

    // Filter out any undefined conditions
    const filteredConditions = conditions.filter(Boolean);

    // Determine order column and direction
    let orderByColumn: any = products.created_at;
    let orderByDirection: 'asc' | 'desc' = 'desc';
    switch (sortBy) {
      case 'oldest':
        orderByColumn = products.created_at;
        orderByDirection = 'asc';
        break;
      case 'price_asc':
        orderByColumn = products.price;
        orderByDirection = 'asc';
        break;
      case 'price_desc':
        orderByColumn = products.price;
        orderByDirection = 'desc';
        break;
      case 'rating':
        orderByColumn = products.average_rating;
        orderByDirection = 'desc';
        break;
      default: // newest
        orderByColumn = products.created_at;
        orderByDirection = 'desc';
    }

    // Build query with .orderBy and .where
    const dbQuery = db
      .select()
      .from(products)
      .where(
        filteredConditions.length > 1
          ? and(...filteredConditions)
          : filteredConditions[0]
      )
      .orderBy(orderByDirection === 'desc' ? desc(orderByColumn) : orderByColumn);

    const agents = await dbQuery;

    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Error searching agents:', error);
    return NextResponse.json(
      { error: 'Failed to search agents' },
      { status: 500 }
    );
  }
} 