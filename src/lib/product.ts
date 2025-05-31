import { Prisma } from '@prisma/client';
import prismaClient from './db';
import { Product } from './schema';

export interface ProductOptions {
  category?: string;
  seller?: string;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
}

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  seller: string;
  stock: number;
  rating?: number;
  downloadCount?: number;
  isPublic?: boolean;
}): Promise<Product> {
  return await prismaClient.product.create({
    data: {
      ...data,
      rating: data.rating || 0,
      downloadCount: data.downloadCount || 0,
      isPublic: data.isPublic || true,
    },
  });
}

export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<Product> {
  return await prismaClient.product.update({
    where: { id },
    data,
  });
}

export async function getProducts(
  options: ProductOptions = {}
): Promise<Product[]> {
  const where: Prisma.ProductWhereInput = {};

  if (options.category) where.category = options.category;
  if (options.seller) where.seller = options.seller;
  if (options.minPrice) where.price = { gte: options.minPrice };
  if (options.maxPrice) where.price = { lte: options.maxPrice };
  if (options.query) {
    where.OR = [
      { name: { contains: options.query, mode: 'insensitive' } },
      { description: { contains: options.query, mode: 'insensitive' } },
    ];
  }

  return await prismaClient.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProduct(id: string): Promise<Product | null> {
  return await prismaClient.product.findUnique({
    where: { id },
    include: {
      category: true,
      seller: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await prismaClient.product.delete({
    where: { id },
  });
}

export async function getProductReviews(
  productId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<any[]> {
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

export async function createProductReview(data: {
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
}): Promise<any> {
  const review = await prismaClient.review.create({
    data,
  });

  await updateProductRating(data.productId);

  return review;
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

export async function getRelatedProducts(
  productId: string,
  limit: number = 4
): Promise<Product[]> {
  const product = await getProduct(productId);
  if (!product) return [];

  return await prismaClient.product.findMany({
    where: {
      category: product.category,
      id: { not: productId },
    },
    take: limit,
  });
}

export async function getProductPurchases(
  productId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<any[]> {
  const where: Prisma.PurchaseWhereInput = { productId };

  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prismaClient.purchase.findMany({
    where,
    include: {
      user: true,
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
}

export async function updateProductDownloadCount(
  productId: string
): Promise<void> {
  await prismaClient.product.update({
    where: { id: productId },
    data: {
      downloadCount: {
        increment: 1,
      },
    },
  });
} 