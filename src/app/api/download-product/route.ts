import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { join } from 'path';
import { readFile } from 'fs/promises';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { product_id } = await req.json();
    if (!product_id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: product_id }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Read file from local storage
    const filePath = join(process.cwd(), 'public', product.file_url);
    const fileBuffer = await readFile(filePath);

    // Return file as download
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${product.name}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading product:', error);
    return NextResponse.json(
      { error: 'Failed to download product' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('productId');

    if (!product_id) {
      return new NextResponse('Product ID is required', { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: product_id }
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    // Check if user has purchased the product
    const purchase = await prisma.purchase.findFirst({
      where: { product_id: product_id }
    });

    if (!purchase) {
      return new NextResponse('You have not purchased this product', { status: 403 });
    }

    // Read file from local storage
    const filePath = join(process.cwd(), 'public', product.file_url);
    const fileBuffer = await readFile(filePath);

    // Return file as download
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${product.name}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading product:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 