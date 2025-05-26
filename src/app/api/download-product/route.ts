import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getProduct, checkProductPurchase } from '@/lib/db-helpers';
import { getS3SignedUrl } from '@/lib/s3-helpers';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Get product info
    const product = await getProduct(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if user has purchased the product
    if (!session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const hasPurchased = await checkProductPurchase(session.user.id, productId);
    if (!hasPurchased) {
      return NextResponse.json({ error: 'Product not purchased' }, { status: 403 });
    }

    // Generate signed URL
    const signedUrl = await getS3SignedUrl(product.file_url, 600); // 10 minutes

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

export async function GET(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get product details
    const product = await getProduct(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Generate signed URL for S3 object
    const signedUrl = await getS3SignedUrl(product.file_url, 3600); // 1 hour

    if (!signedUrl) {
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
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