import { NextRequest, NextResponse } from 'next/server';
import { getTrendingProducts } from '@/lib/db-helpers';

export async function GET(request: NextRequest) {
  try {
    const products = await getTrendingProducts(10);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching trending products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending products' },
      { status: 500 }
    );
  }
} 