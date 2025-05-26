import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { eq, and, gte, lte, ilike, or } from 'drizzle-orm';

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
      conditions.push(gte(products.average_rating, parseFloat(minRating)));
    }

    // Filter out any undefined conditions
    const filteredConditions = conditions.filter(Boolean);

    let dbQuery = db
      .select()
      .from(products)
      .where(
        filteredConditions.length > 1
          ? and(...filteredConditions)
          : filteredConditions[0]
      );

    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        dbQuery = dbQuery.orderBy(products.created_at);
        break;
      case 'price_asc':
        dbQuery = dbQuery.orderBy(products.price);
        break;
      case 'price_desc':
        dbQuery = dbQuery.orderBy(products.price, 'desc');
        break;
      case 'rating':
        dbQuery = dbQuery.orderBy(products.average_rating, 'desc');
        break;
      default: // newest
        dbQuery = dbQuery.orderBy(products.created_at, 'desc');
    }

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