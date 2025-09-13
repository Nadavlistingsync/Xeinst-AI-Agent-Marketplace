import { NextResponse } from 'next/server';
import { prisma } from "../../../../lib/prisma";
import { z } from 'zod';

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  longDescription: z.string().nullable(),
  category: z.string(),
  price: z.number().nullable(),
  imageUrl: z.string().nullable(),
  rating: z.number().nullable(),
  features: z.array(z.string()).nullable(),
  requirements: z.array(z.string()).nullable(),
  createdBy: z.string(),
  average_rating: z.number(),
  total_ratings: z.number(),
  created_at: z.date(),
});

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
): Promise<NextResponse> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.slug },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const validatedProduct = ProductSchema.parse(product);
    return NextResponse.json(validatedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid product data' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { slug: string } }
): Promise<NextResponse> {
  try {
    const product = await prisma.product.delete({
      where: { id: params.slug },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 