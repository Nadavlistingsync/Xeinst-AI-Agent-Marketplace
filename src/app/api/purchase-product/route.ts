import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, users, earnings } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Get product details
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!product.uploaded_by) {
      return NextResponse.json({ error: 'Product creator not found' }, { status: 404 });
    }

    // Get creator details
    const [creator] = await db
      .select()
      .from(users)
      .where(eq(users.id, product.uploaded_by))
      .limit(1);

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // Calculate earnings
    const earningsAmount = Number(product.price) * Number(product.earnings_split);

    // Create earnings record
    await db.insert(earnings).values({
      user_id: creator.id,
      product_id: product.id,
      amount: earningsAmount,
      status: 'pending',
    });

    // Update product download count
    await db
      .update(products)
      .set({ download_count: product.download_count + 1 })
      .where(eq(products.id, product.id));

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        download_url: `/api/download-agent?id=${product.id}`,
      },
    });
  } catch (error) {
    console.error('Error purchasing product:', error);
    return NextResponse.json(
      { error: 'Failed to purchase product' },
      { status: 500 }
    );
  }
} 