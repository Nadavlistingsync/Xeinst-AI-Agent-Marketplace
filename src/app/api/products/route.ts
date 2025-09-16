import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { z } from 'zod';
import { createErrorResponse, createSuccessResponse } from '@/lib/api';
import { isDatabaseAvailable, createDatabaseErrorResponse } from "@/lib/db-check";

const ProductInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  longDescription: z.string().max(2000).optional(),
  category: z.string().min(1),
  price: z.number().min(0).optional(),
  imageUrl: z.string().url().optional(),
  features: z.array(z.string()).max(20).optional(),
  requirements: z.array(z.string()).max(20).optional(),
  isPublic: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  earnings_split: z.number().min(0).max(100).optional(),
  fileUrl: z.string().url().optional(),
  tags: z.array(z.string()).max(20).optional(),
  version: z.string().min(1).max(100).optional(),
  environment: z.string().min(1).max(100).optional(),
  framework: z.string().min(1).max(100).optional(),
  modelType: z.string().min(1).max(100).optional(),
  earningsSplit: z.number().min(0).max(100).optional(),
});

export async function GET(): Promise<NextResponse> {
    // Check if database is available
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        createDatabaseErrorResponse(),
        { status: 503 }
      );
    }

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
    return createSuccessResponse({ products: allProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    return createErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse(new Error('Unauthorized'));
    }

    const body = await request.json();
    const validatedData = ProductInputSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        fileUrl: validatedData.fileUrl || '',
        price: validatedData.price || 0,
        category: validatedData.category,
        tags: validatedData.tags || [],
        version: validatedData.version || '1.0.0',
        environment: validatedData.environment || 'production',
        framework: validatedData.framework || 'default',
        modelType: validatedData.modelType || 'default',
        createdBy: session.user.id,
        earningsSplit: validatedData.earningsSplit || 0,
        isPublic: validatedData.isPublic ?? true,
        longDescription: validatedData.longDescription || '',
        requirements: validatedData.requirements || [],
        status: 'draft',
        accessLevel: 'public',
        licenseType: 'free'
      }
    });

    return createSuccessResponse(product);
  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof z.ZodError) {
      return createErrorResponse(error);
    }
    return createErrorResponse(error);
  }
}

export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse(new Error('Unauthorized'));
    }

    const data = await request.json();
    const { id, ...updateData } = data;
    const parsed = ProductInputSchema.safeParse(updateData);
    if (!id || !parsed.success) {
      return createErrorResponse(new Error('Invalid product data'));
    }

    const updatedProduct = await prisma.product.update({
      where: { id: id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        category: parsed.data.category,
        tags: parsed.data.tags,
        version: parsed.data.version,
        environment: parsed.data.environment,
        framework: parsed.data.framework,
        modelType: parsed.data.modelType,
        earningsSplit: parsed.data.earningsSplit,
        isPublic: parsed.data.isPublic,
        longDescription: parsed.data.longDescription,
        updatedAt: new Date()
      }
    });
    return createSuccessResponse(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return createErrorResponse(error);
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse(new Error('Unauthorized'));
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return createErrorResponse(new Error('Product ID is required'));
    }

    await prisma.product.delete({ where: { id } });
    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return createErrorResponse(error);
  }
} 