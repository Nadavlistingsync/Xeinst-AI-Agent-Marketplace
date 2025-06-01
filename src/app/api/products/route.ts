import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { createErrorResponse } from '@/lib/api';

const ProductInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  longDescription: z.string().max(2000).optional(),
  category: z.string().min(1),
  price: z.number().min(0).optional(),
  image_url: z.string().url().optional(),
  features: z.array(z.string()).max(20).optional(),
  requirements: z.array(z.string()).max(20).optional(),
  isPublic: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  earnings_split: z.number().min(0).max(100).optional(),
});

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    const allProducts = await prisma.product.findMany({
      where: {
        OR: [
          { isPublic: true },
          { createdBy: session?.user?.id }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json({ products: allProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    const errorResponse = createErrorResponse(error, 'Failed to fetch products');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = ProductInputSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    const errorResponse = createErrorResponse(error, 'Failed to create product');
    return NextResponse.json(
      { error: errorResponse.message },
      { status: errorResponse.status }
    );
  }
}

export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;
    const parsed = ProductInputSchema.safeParse(updateData);
    if (!id || !parsed.success) {
      return NextResponse.json({ error: 'Invalid product data', details: parsed.error?.errors }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...parsed.data,
        updated_at: new Date(),
      },
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
} 