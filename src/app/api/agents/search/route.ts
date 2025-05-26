import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { eq, gte, lte, ilike, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('minRating');
    const sortBy = searchParams.get('sortBy') || 'newest';

    let dbQuery = db
      .select()
      .from(products)
      .where(eq(products.is_public, true));

    // Apply text search
    if (query) {
      dbQuery = dbQuery.where(
        or(
          ilike(products.name, `%${query}%`),
          ilike(products.description, `%${query}%`),
          ilike(products.category, `%${query}%`)
        )
      );
    }

    // Apply category filter
    if (category && category !== 'All') {
      dbQuery = dbQuery.where(eq(products.category, category));
    }

    // Apply price filters
    if (minPrice) {
      dbQuery = dbQuery.where(gte(products.price, parseFloat(minPrice)));
    }
    if (maxPrice) {
      dbQuery = dbQuery.where(lte(products.price, parseFloat(maxPrice)));
    }

    // Apply rating filter
    if (minRating) {
      dbQuery = dbQuery.where(gte(products.average_rating, parseFloat(minRating)));
    }

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