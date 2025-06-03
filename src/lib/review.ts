import { prisma } from './db';
import { Prisma } from '@prisma/client';
import { Review } from './schema';

export interface ReviewOptions {
  product_id?: string;
  user_id?: string;
  minRating?: number;
  maxRating?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateReviewInput {
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
}

export async function createReview(data: CreateReviewInput): Promise<Review> {
  try {
    return await prisma.review.create({
      data: {
        product_id: data.product_id,
        user_id: data.user_id,
        rating: data.rating,
        comment: data.comment || '',
        created_at: new Date(),
      },
    });
  } catch (error) {
    console.error('Error creating review:', error);
    throw new Error('Failed to create review');
  }
}

export async function updateReview(
  id: string,
  data: {
    rating?: number;
    comment?: string;
  }
): Promise<Review> {
  try {
    return await prisma.review.update({
      where: { id },
      data,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    throw new Error('Failed to update review');
  }
}

export async function getReviews(options: {
  user_id?: string;
  product_id?: string;
  rating?: number;
  startDate?: Date;
  endDate?: Date;
} = {}): Promise<Review[]> {
  try {
    const where: Prisma.ReviewWhereInput = {};
    
    if (options.user_id) where.user_id = options.user_id;
    if (options.product_id) where.product_id = options.product_id;
    if (options.rating) where.rating = options.rating;
    if (options.startDate) where.created_at = { gte: options.startDate };
    if (options.endDate) where.created_at = { lte: options.endDate };

    return await prisma.review.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  } catch (error) {
    console.error('Error getting reviews:', error);
    throw new Error('Failed to get reviews');
  }
}

export async function getReview(id: string): Promise<Review | null> {
  try {
    return await prisma.review.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error getting review:', error);
    throw new Error('Failed to get review');
  }
}

export async function deleteReview(id: string): Promise<void> {
  try {
    await prisma.review.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    throw new Error('Failed to delete review');
  }
}

export async function updateProductRating(product_id: string): Promise<void> {
  const reviews = await prisma.review.findMany({
    where: { product_id },
  });

  const average_rating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  await prisma.product.update({
    where: { id: product_id },
    data: { rating: average_rating },
  });
}

export async function getUserReviews(
  user_id: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<Review[]> {
  const where: Prisma.ReviewWhereInput = { user_id };

  if (options.startDate) where.created_at = { gte: options.startDate };
  if (options.endDate) where.created_at = { lte: options.endDate };

  return await prisma.review.findMany({
    where,
    include: {
      product: true,
    },
    orderBy: { created_at: 'desc' },
    take: options.limit,
  });
}

export async function getProductReviews(
  product_id: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<Review[]> {
  const where: Prisma.ReviewWhereInput = { product_id };

  if (options.startDate) where.created_at = { gte: options.startDate };
  if (options.endDate) where.created_at = { lte: options.endDate };

  return await prisma.review.findMany({
    where,
    include: {
      user: true,
    },
    orderBy: { created_at: 'desc' },
    take: options.limit,
  });
}

export async function getReviewStats(product_id: string) {
  try {
    const reviews = await getReviews({ product_id });

    const totalReviews = reviews.length;
    const average_rating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    const ratingDistribution = reviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      totalReviews,
      average_rating,
      ratingDistribution,
      recentReviews: reviews.slice(0, 5),
    };
  } catch (error) {
    console.error('Error getting review stats:', error);
    throw new Error('Failed to get review stats');
  }
}

export async function getReviewHistory(product_id: string) {
  try {
    const reviews = await getReviews({ product_id });

    const monthlyReviews = reviews.reduce((acc, review) => {
      const month = review.created_at.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { total: 0, average_rating: 0 };
      }
      acc[month].total += 1;
      acc[month].average_rating = (acc[month].average_rating * (acc[month].total - 1) + review.rating) / acc[month].total;
      return acc;
    }, {} as Record<string, { total: number; average_rating: number }>);

    return {
      monthlyReviews,
      recentReviews: reviews.slice(0, 10),
    };
  } catch (error) {
    console.error('Error getting review history:', error);
    throw new Error('Failed to get review history');
  }
} 