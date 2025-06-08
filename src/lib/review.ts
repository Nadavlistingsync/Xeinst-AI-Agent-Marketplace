import { PrismaClient, Prisma } from '@prisma/client';
import { Review } from './schema';
import { prisma } from './db';

const prismaClient = new PrismaClient();

export interface ReviewOptions {
  productId?: string;
  userId?: string;
  minRating?: number;
  maxRating?: number;
  startDate?: Date;
  endDate?: Date;
}

export type CreateReviewInput = {
  productId: string;
  userId: string;
  deploymentId: string;
  rating: number;
  comment: string;
};

export type UpdateReviewInput = {
  rating?: number;
  comment?: string;
};

export async function createReview(data: CreateReviewInput) {
  return prismaClient.review.create({
    data: {
      productId: data.productId,
      userId: data.userId,
      deploymentId: data.deploymentId,
      rating: data.rating,
      comment: data.comment
    }
  });
}

export async function updateReview(id: string, data: UpdateReviewInput) {
  return prismaClient.review.update({
    where: { id },
    data
  });
}

export async function getReviews(options: ReviewOptions = {}): Promise<Review[]> {
  try {
    const where: Prisma.ReviewWhereInput = {};
    
    if (options.userId) where.userId = options.userId;
    if (options.productId) where.productId = options.productId;
    if (options.minRating) where.rating = { gte: options.minRating };
    if (options.maxRating) where.rating = { lte: options.maxRating };
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
      include: {
        user: true,
        product: true,
        deployment: true
      }
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
      deployment: true
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
      deployment: true
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

interface ReviewWithNumber extends Omit<Review, 'rating'> {
  rating: number;
}

export async function getReviewById(id: string): Promise<ReviewWithNumber | null> {
  return prismaClient.review.findUnique({
    where: {
      id
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      product: true
    }
  }).then(review => review ? { ...review, rating: Number(review.rating) } : null);
}

export async function getReviewsByUser(userId: string): Promise<ReviewWithNumber[]> {
  return prismaClient.review.findMany({
    where: {
      userId
    },
    include: {
      product: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  }).then(reviews => reviews.map(r => ({ ...r, rating: Number(r.rating) })));
}

export async function getReviewsByProduct(productId: string): Promise<ReviewWithNumber[]> {
  return prismaClient.review.findMany({
    where: {
      productId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  }).then(reviews => reviews.map(r => ({ ...r, rating: Number(r.rating) })));
}

export async function getAverageReviewRating(productId: string): Promise<number> {
  const result = await prismaClient.review.aggregate({
    where: {
      productId
    },
    _avg: {
      rating: true
    }
  });
  return result._avg.rating ? Number(result._avg.rating) : 0;
} 