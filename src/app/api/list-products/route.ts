import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { products } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      // Fetch single product
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);

      if (!product.length) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json({ products: [product[0]] });
    } else {
      // Fetch all products
      const allProducts = await db
        .select()
        .from(products)
        .orderBy(products.created_at);

      return NextResponse.json({ products: allProducts });
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 