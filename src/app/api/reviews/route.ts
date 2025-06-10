import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { withErrorHandling } from '@/lib/error-handling';
import { db } from '@/lib/db';
import { AppError } from '@/lib/error-handling';
import { cache } from '@/lib/cache';

const reviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(1000),
  title: z.string().max(100).optional(),
  images: z.array(z.string().url()).max(5).optional(),
  deploymentId: z.string().uuid().optional(),
  userId: z.string().uuid()
});

const CACHE_TTL = 60 * 5; // 5 minutes

export async function GET(request: NextRequest): Promise<NextResponse> {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      throw new AppError('Product ID is required', 400, 'MISSING_PRODUCT_ID');
    }

    // Try to get from cache first
    const cacheKey = `reviews:${productId}`;
    const cachedReviews = await cache.get(cacheKey, [`product:${productId}`]);
    
    if (cachedReviews) {
      return NextResponse.json(cachedReviews);
    }
    
    // If not in cache, fetch from database
    const reviews = await db.withRetry(
      () => db.getClient().review.findMany({
        where: { productId },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      undefined,
      { operation: 'get_reviews', productId }
    );
    
    // Cache the results
    await cache.set(cacheKey, reviews, {
      ttl: CACHE_TTL,
      tags: [`product:${productId}`]
    });
    
    return NextResponse.json(reviews);
  }, { endpoint: '/api/reviews', method: 'GET' });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return withErrorHandling(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = reviewSchema.parse(body);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: validatedData.productId,
        userId: session.user.id
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    // Create review data object
    const reviewData = {
      rating: validatedData.rating,
      comment: validatedData.comment,
      userId: session.user.id,
      productId: validatedData.productId,
      deploymentId: validatedData.deploymentId || product.id
    };

    const review = await prisma.review.create({
      data: reviewData
    });

    // Update product average rating
    const productReviews = await prisma.review.findMany({
      where: { productId: validatedData.productId }
    });

    const averageRating = productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length;

    await prisma.product.update({
      where: { id: validatedData.productId },
      data: {
        rating: averageRating
      }
    });

    // Invalidate cache for this product's reviews
    await cache.invalidateByTags([`product:${validatedData.productId}`]);

    return NextResponse.json(review);
  }, { endpoint: '/api/reviews', method: 'POST' });
} 