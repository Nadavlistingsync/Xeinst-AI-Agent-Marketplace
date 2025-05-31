import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { products, purchases } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { getSignedUrl } from '@/lib/s3-helpers';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product[0]) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product[0].userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const signedUrl = await getSignedUrl(product[0].file_url);

    if (!signedUrl) {
      return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
    }

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, params.id))
      .limit(1);

    if (!product[0]) {
      return new NextResponse('Product not found', { status: 404 });
    }

    // Check if user has purchased the product
    const purchase = await db
      .select()
      .from(purchases)
      .where(and(
        eq(purchases.user_id, session.user.id),
        eq(purchases.product_id, params.id),
        eq(purchases.status, 'completed')
      ))
      .limit(1);

    // If product is not free and user hasn't purchased it
    if (parseFloat(product[0].price) > 0 && !purchase[0]) {
      return new NextResponse('Purchase required', { status: 403 });
    }

    // Get signed URL for the file
    const signedUrl = await getSignedUrl(product[0].file_url);

    // Update download count
    await db
      .update(products)
      .set({
        download_count: product[0].download_count + 1
      })
      .where(eq(products.id, params.id));

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error('Error downloading product:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 