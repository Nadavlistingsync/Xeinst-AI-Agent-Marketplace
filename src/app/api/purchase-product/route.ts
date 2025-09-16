import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from 'zod';

const purchaseSchema = z.object({
  productId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { productId } = purchaseSchema.parse(body);

    // Get product details with creator
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.accessLevel !== 'public' && product.createdBy !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Calculate earnings
    const earningsAmount = (Number(product.price) * Number(product.earningsSplit)).toFixed(2);

    // Create earnings record and update product in a transaction
    await prisma.$transaction([
      prisma.earning.create({
        data: {
          userId: product.creator.id,
          productId: product.id,
          amount: parseFloat(earningsAmount),
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.product.update({
        where: { id: product.id },
        data: {
          downloadCount: {
            increment: 1,
          },
        },
      }),
    ]);

    await prisma.purchase.create({
      data: {
        status: 'pending',
        userId: session.user.id,
        productId: product.id,
        amount: product.price
      }
    });

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        downloadUrl: `/api/download-product?id=${product.id}`,
      },
    });
  } catch (error) {
    console.error('Error purchasing product:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to purchase product' },
      { status: 500 }
    );
  }
} 