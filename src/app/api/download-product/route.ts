import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { join } from 'path';
import { readFile } from 'fs/promises';

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

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Read file from local storage
    const filePath = join(process.cwd(), 'public', product.fileUrl);
    const fileBuffer = await readFile(filePath);

    // Return file as download
    const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
    return new NextResponse(arrayBuffer as ArrayBuffer, {
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
    const productId = searchParams.get('productId');

    if (!productId) {
      return new NextResponse('Product ID is required', { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    // Check if user has purchased the product
    const purchase = await prisma.purchase.findFirst({
      where: { productId: productId }
    });

    if (!purchase) {
      return new NextResponse('You have not purchased this product', { status: 403 });
    }

    // Read file from local storage
    const filePath = join(process.cwd(), 'public', product.fileUrl);
    const fileBuffer = await readFile(filePath);

    // Return file as download
    const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
    return new NextResponse(arrayBuffer as ArrayBuffer, {
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