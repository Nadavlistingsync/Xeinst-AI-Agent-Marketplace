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

export interface CreateProductInput {
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: string;
  price: number;
  imageUrl?: string;
  fileUrl: string;
  documentation?: string;
  features: string[];
  requirements: string[];
  createdBy: string;
  uploadedBy: string;
  isPublic?: boolean;
  isFeatured?: boolean;
  earningsSplit?: number;
}

export async function createProduct(data: CreateProductInput): Promise<Product> {
  try {
    return await prismaClient.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        longDescription: data.longDescription,
        category: data.category,
        price: new Prisma.Decimal(data.price),
        imageUrl: data.imageUrl,
        fileUrl: data.fileUrl,
        documentation: data.documentation,
        features: data.features,
        requirements: data.requirements,
        createdBy: data.createdBy,
        uploadedBy: data.uploadedBy,
        isPublic: data.isPublic ?? true,
        isFeatured: data.isFeatured ?? false,
        earningsSplit: new Prisma.Decimal(data.earningsSplit ?? 0.70),
        rating: 0,
        averageRating: new Prisma.Decimal(0),
        totalRatings: 0,
        downloadCount: 0,
      },
    });
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product');
  }
}

export async function updateProduct(
  id: string,
  data: Partial<CreateProductInput>
): Promise<Product> {
  try {
    const updateData: any = { ...data };
    if (data.price !== undefined) {
      updateData.price = new Prisma.Decimal(data.price);
    }
    if (data.earningsSplit !== undefined) {
      updateData.earningsSplit = new Prisma.Decimal(data.earningsSplit);
    }

    return await prismaClient.product.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
}

export async function getProducts(options: {
  category?: string;
  seller?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  search?: string;
} = {}): Promise<Product[]> {
  try {
    const where: Prisma.ProductWhereInput = {};
    
    if (options.category) where.category = options.category;
    if (options.seller) where.seller = options.seller;
    if (options.minPrice) where.price = { gte: options.minPrice };
    if (options.maxPrice) where.price = { lte: options.maxPrice };
    if (options.status) where.status = options.status;
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    return await prismaClient.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error getting products:', error);
    throw new Error('Failed to get products');
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    return await prismaClient.product.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error getting product:', error);
    throw new Error('Failed to get product');
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await prismaClient.product.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
}

export async function getProductStats() {
  try {
    const products = await getProducts();

    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + product.price, 0);
    const averagePrice = totalValue / totalProducts;
    const priceDistribution = products.reduce((acc, product) => {
      const range = Math.floor(product.price / 100) * 100;
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      totalProducts,
      totalValue,
      averagePrice,
      priceDistribution,
    };
  } catch (error) {
    console.error('Error getting product stats:', error);
    throw new Error('Failed to get product stats');
  }
}

export async function getProductHistory() {
  try {
    const products = await getProducts();

    const monthlyProducts = products.reduce((acc, product) => {
      const month = product.createdAt.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { total: 0, categories: {} as Record<string, number> };
      }
      acc[month].total += 1;
      acc[month].categories[product.category] = (acc[month].categories[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, { total: number; categories: Record<string, number> }>);

    return {
      monthlyProducts,
      recentProducts: products.slice(0, 10),
    };
  } catch (error) {
    console.error('Error getting product history:', error);
    throw new Error('Failed to get product history');
  }
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