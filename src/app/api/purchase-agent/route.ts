import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getProduct } from '@/lib/db-helpers';
import { db } from '@/lib/db';
import { purchases } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await getProduct(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user has already purchased this product
    const [existing] = await db.select()
      .from(purchases)
      .where(and(eq(purchases.product_id, productId), eq(purchases.user_id, session.user.id)));

    if (existing) {
      return NextResponse.json(
        { error: 'You have already purchased this product' },
        { status: 400 }
      );
    }

    // Create purchase record
    const [purchase] = await db.insert(purchases)
      .values({
        productId: productId,
        userId: session.user.id,
        amount: product.price,
        status: 'completed',
      })
      .returning();

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Error processing purchase:', error);
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    );
  }
} 