import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  long_description: z.string().nullable(),
  category: z.string(),
  price: z.number().nullable(),
  image_url: z.string().nullable(),
  rating: z.number().nullable(),
  features: z.array(z.string()).nullable(),
  requirements: z.array(z.string()).nullable(),
  created_by: z.string(),
  average_rating: z.number(),
  total_ratings: z.number(),
  created_at: z.date(),
});

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, params.slug))
      .limit(1);

    if (!product.length) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const validatedProduct = ProductSchema.parse(product[0]);

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
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const result = await db
      .delete(products)
      .where(eq(products.id, params.slug))
      .returning();

    if (!result.length) {
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