import { Prisma } from '@prisma/client';
import prismaClient from './db';
import { Product } from './schema';

export async function getProduct(id: string): Promise<Product | null> {
  return await prismaClient.product.findUnique({
    where: { id },
    include: {
      category: true,
      seller: true,
      reviews: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
}

export async function getRelatedProducts(productId: string, category: string): Promise<Product[]> {
  return await prismaClient.product.findMany({
    where: {
      category: {
        name: category,
      },
      NOT: {
        id: productId,
      },
    },
    take: 4,
    include: {
      category: true,
      seller: true,
    },
  });
}

export async function getProductReviews(productId: string): Promise<any[]> {
  return await prismaClient.review.findMany({
    where: {
      productId,
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function createProductReview(data: {
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
}): Promise<any> {
  return await prismaClient.review.create({
    data,
    include: {
      user: true,
    },
  });
}

export async function updateProductRating(productId: string): Promise<void> {
  const reviews = await prismaClient.review.findMany({
    where: { productId },
  });

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  await prismaClient.product.update({
    where: { id: productId },
    data: {
      rating: averageRating,
    },
  });
} 