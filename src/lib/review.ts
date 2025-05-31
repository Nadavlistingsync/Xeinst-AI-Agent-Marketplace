import { Prisma } from '@prisma/client';
import prismaClient from './db';
import { Review } from './schema';

export interface ReviewOptions {
  productId?: string;
  userId?: string;
  minRating?: number;
  maxRating?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateReviewInput {
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
}

export async function createReview(data: CreateReviewInput): Promise<Review> {
  try {
    return await prismaClient.review.create({
      data: {
        productId: data.productId,
        userId: data.userId,
        rating: data.rating,
        comment: data.comment,
        createdAt: new Date(),
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
    return await prismaClient.review.update({
      where: { id },
      data,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    throw new Error('Failed to update review');
  }
}

export async function getReviews(options: {
  userId?: string;
  productId?: string;
  rating?: number;
  startDate?: Date;
  endDate?: Date;
} = {}): Promise<Review[]> {
  try {
    const where: Prisma.ReviewWhereInput = {};
    
    if (options.userId) where.userId = options.userId;
    if (options.productId) where.productId = options.productId;
    if (options.rating) where.rating = options.rating;
    if (options.startDate) where.createdAt = { gte: options.startDate };
    if (options.endDate) where.createdAt = { lte: options.endDate };

    return await prismaClient.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error getting reviews:', error);
    throw new Error('Failed to get reviews');
  }
}

export async function getReview(id: string): Promise<Review | null> {
  try {
    return await prismaClient.review.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error getting review:', error);
    throw new Error('Failed to get review');
  }
}

export async function deleteReview(id: string): Promise<void> {
  try {
    await prismaClient.review.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    throw new Error('Failed to delete review');
  }
}

export async function updateProductRating(productId: string): Promise<void> {
  const reviews = await prismaClient.review.findMany({
    where: { productId },
  });

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  await prismaClient.product.update({
    where: { id: productId },
    data: { rating: averageRating },
  });
}

export async function getUserReviews(
  userId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<Review[]> {
  const where: Prisma.ReviewWhereInput = { userId };

  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prismaClient.review.findMany({
    where,
    include: {
      product: true,
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
}

export async function getProductReviews(
  productId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<Review[]> {
  const where: Prisma.ReviewWhereInput = { productId };

  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prismaClient.review.findMany({
    where,
    include: {
      user: true,
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
}

export async function getReviewStats(productId: string) {
  try {
    const reviews = await getReviews({ productId });

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    const ratingDistribution = reviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      totalReviews,
      averageRating,
      ratingDistribution,
      recentReviews: reviews.slice(0, 5),
    };
  } catch (error) {
    console.error('Error getting review stats:', error);
    throw new Error('Failed to get review stats');
  }
}

export async function getReviewHistory(productId: string) {
  try {
    const reviews = await getReviews({ productId });

    const monthlyReviews = reviews.reduce((acc, review) => {
      const month = review.createdAt.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { total: 0, averageRating: 0 };
      }
      acc[month].total += 1;
      acc[month].averageRating = (acc[month].averageRating * (acc[month].total - 1) + review.rating) / acc[month].total;
      return acc;
    }, {} as Record<string, { total: number; averageRating: number }>);

    return {
      monthlyReviews,
      recentReviews: reviews.slice(0, 10),
    };
  } catch (error) {
    console.error('Error getting review history:', error);
    throw new Error('Failed to get review history');
  }
} 