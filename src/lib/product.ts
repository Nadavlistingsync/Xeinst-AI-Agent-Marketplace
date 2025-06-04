import { PrismaClient, Prisma, ProductStatus, ProductAccessLevel, ProductLicenseType } from '@prisma/client';
import { Product } from './schema';
import { Product as PrismaProduct } from '@prisma/client';

const prismaClient = new PrismaClient();

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  createdBy: string;
  status?: ProductStatus;
  accessLevel?: ProductAccessLevel;
  licenseType?: ProductLicenseType;
  environment?: string;
  framework?: string;
  modelType?: string;
  version?: string;
  metadata?: Record<string, any>;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  imageUrl?: string;
  status?: ProductStatus;
  accessLevel?: ProductAccessLevel;
  licenseType?: ProductLicenseType;
  environment?: string;
  framework?: string;
  modelType?: string;
  version?: string;
  metadata?: Record<string, any>;
}

export interface ProductFilter {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  accessLevel?: ProductAccessLevel;
  licenseType?: ProductLicenseType;
  environment?: string;
  framework?: string;
  modelType?: string;
  createdBy?: string;
}

function toProduct(obj: PrismaProduct): Product {
  return {
    ...obj,
    price: Number(obj.price),
    earningsSplit: Number(obj.earningsSplit),
  };
}

export async function createProduct(data: CreateProductInput) {
  return prismaClient.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      createdBy: data.createdBy,
      status: data.status || ProductStatus.draft,
      accessLevel: data.accessLevel || ProductAccessLevel.public,
      licenseType: data.licenseType || ProductLicenseType.free,
      environment: data.environment || 'production',
      framework: data.framework || 'custom',
      modelType: data.modelType || 'general',
      version: data.version || '1.0.0',
      fileUrl: data.imageUrl || '',
      earningsSplit: 0.8, // Default earnings split
    },
  }).then(toProduct);
}

export async function updateProduct(id: string, data: UpdateProductInput) {
  return prismaClient.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      status: data.status,
      accessLevel: data.accessLevel,
      licenseType: data.licenseType,
      environment: data.environment,
      framework: data.framework,
      modelType: data.modelType,
      version: data.version,
    },
  }).then(toProduct);
}

export async function getProduct(id: string) {
  return prismaClient.product.findUnique({
    where: { id },
    include: {
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
  }).then(product => (product ? toProduct(product) : null));
}

export async function getProducts(filter: ProductFilter = {}) {
  const where: Prisma.ProductWhereInput = {};

  if (filter.search) {
    where.OR = [
      { name: { contains: filter.search, mode: 'insensitive' } },
      { description: { contains: filter.search, mode: 'insensitive' } },
    ];
  }

  if (filter.category) {
    where.category = filter.category;
  }

  if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
    where.price = {};
    if (filter.minPrice !== undefined) where.price.gte = filter.minPrice;
    if (filter.maxPrice !== undefined) where.price.lte = filter.maxPrice;
  }

  if (filter.status) where.status = filter.status;
  if (filter.accessLevel) where.accessLevel = filter.accessLevel;
  if (filter.licenseType) where.licenseType = filter.licenseType;
  if (filter.environment) where.environment = filter.environment;
  if (filter.framework) where.framework = filter.framework;
  if (filter.modelType) where.modelType = filter.modelType;
  if (filter.createdBy) where.createdBy = filter.createdBy;

  return prismaClient.product.findMany({
    where,
    include: {
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  }).then(products => products.map(toProduct));
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
  const [totalProducts, totalRevenue, categoryDistribution, statusDistribution] = await Promise.all([
    prismaClient.product.count(),
    prismaClient.product.aggregate({
      _sum: {
        price: true,
      },
    }),
    prismaClient.product.groupBy({
      by: ['category'],
      _count: true,
    }),
    prismaClient.product.groupBy({
      by: ['status'],
      _count: true,
    }),
  ]);

  return {
    totalProducts,
    totalRevenue: totalRevenue._sum.price || 0,
    categoryDistribution: categoryDistribution.reduce((acc, curr) => {
      acc[curr.category] = curr._count;
      return acc;
    }, {} as Record<string, number>),
    statusDistribution: statusDistribution.reduce((acc, curr) => {
      acc[curr.status] = curr._count;
      return acc;
    }, {} as Record<string, number>),
  };
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

export async function getProductReviews(productId: string) {
  return prismaClient.review.findMany({
    where: { deploymentId: productId },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createProductReview(data: {
  deploymentId: string;
  userId: string;
  rating: number;
  comment: string;
}) {
  const review = await prismaClient.review.create({
    data: {
      deploymentId: data.deploymentId,
      userId: data.userId,
      rating: data.rating,
      comment: data.comment,
    },
  });

  await updateProductRating(data.deploymentId);

  return review;
}

export async function updateProductRating(product_id: string): Promise<void> {
  const reviews = await prismaClient.review.findMany({
    where: { deploymentId: product_id },
  });

  const average_rating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  await prismaClient.product.update({
    where: { id: product_id },
    data: { rating: average_rating },
  });
}

export async function getRelatedProducts(
  product_id: string,
  limit: number = 4
): Promise<Product[]> {
  const product = await getProduct(product_id);
  if (!product) return [];

  return await prismaClient.product.findMany({
    where: {
      category: product.category,
      id: { not: product_id },
    },
    take: limit,
  });
}

export async function getProductPurchases(
  product_id: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<any[]> {
  const where: Prisma.PurchaseWhereInput = { productId: product_id };

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
  product_id: string
): Promise<void> {
  await prismaClient.product.update({
    where: { id: product_id },
    data: {
      downloadCount: {
        increment: 1,
      },
    },
  });
} 