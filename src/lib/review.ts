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

export async function createReview(data: {
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
}): Promise<Review> {
  const review = await prismaClient.review.create({
    data,
  });

  await updateProductRating(data.productId);

  return review;
}

export async function updateReview(
  id: string,
  data: Partial<Review>
): Promise<Review> {
  const review = await prismaClient.review.update({
    where: { id },
    data,
  });

  if (data.rating) {
    await updateProductRating(review.productId);
  }

  return review;
}

export async function getReviews(
  options: ReviewOptions = {}
): Promise<Review[]> {
  const where: Prisma.ReviewWhereInput = {};

  if (options.productId) where.productId = options.productId;
  if (options.userId) where.userId = options.userId;
  if (options.minRating) where.rating = { gte: options.minRating };
  if (options.maxRating) where.rating = { lte: options.maxRating };
  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prismaClient.review.findMany({
    where,
    include: {
      user: true,
      product: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getReview(id: string): Promise<Review | null> {
  return await prismaClient.review.findUnique({
    where: { id },
    include: {
      user: true,
      product: true,
    },
  });
}

export async function deleteReview(id: string): Promise<void> {
  const review = await prismaClient.review.delete({
    where: { id },
  });

  await updateProductRating(review.productId);
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

export async function getReviewStats(productId: string): Promise<{
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}> {
  const reviews = await prismaClient.review.findMany({
    where: { productId },
  });

  const totalReviews = reviews.length;
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

  const ratingDistribution = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return {
    totalReviews,
    averageRating,
    ratingDistribution,
  };
} 