import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const purchaseSchema = z.object({
  productId: z.string().uuid(),
});

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { productId } = purchaseSchema.parse(body);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user has already purchased this product
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        productId,
        userId: session.user.id,
      }
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'You have already purchased this product' },
        { status: 400 }
      );
    }

    // Create purchase record
    const purchase = await prisma.purchase.create({
      data: {
        productId,
        userId: session.user.id,
        amount: product.price,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Error processing purchase:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    );
  }
} 