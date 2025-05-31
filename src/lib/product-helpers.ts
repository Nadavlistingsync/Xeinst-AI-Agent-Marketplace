import { prisma } from './db';

export async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      reviews: true,
      category: true,
      seller: true,
    },
  });
}

export async function getRelatedProducts(productId: string, categoryId: string) {
  return prisma.product.findMany({
    where: {
      categoryId,
      id: { not: productId },
    },
    take: 4,
    include: {
      category: true,
      seller: true,
    },
  });
}

export async function getProductReviews(productId: string) {
  return prisma.review.findMany({
    where: { productId },
    include: {
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  });
} 