import { prisma } from './db';
import { Prisma } from '@prisma/client';
import { Product } from './schema';
import { Product as PrismaProduct, ProductStatus, ProductAccessLevel, ProductLicenseType } from '@prisma/client';

export interface ProductOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
  status?: ProductStatus;
}

export interface CreateProductInput {
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  price: number;
  fileUrl: string;
  requirements: string[];
  tags?: string[];
  version?: string;
  status?: ProductStatus;
  accessLevel?: ProductAccessLevel;
  licenseType?: ProductLicenseType;
  environment: string;
  framework: string;
  modelType: string;
  createdBy: string;
  earningsSplit?: number;
  isPublic?: boolean;
  uploadedBy?: string;
}

function toProduct(obj: PrismaProduct): Product {
  return {
    ...obj,
    price: Number(obj.price),
    earningsSplit: Number(obj.earningsSplit),
  };
}

export async function createProduct(data: CreateProductInput): Promise<Product> {
  try {
    return await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        longDescription: data.longDescription,
        category: data.category,
        price: data.price,
        fileUrl: data.fileUrl,
        requirements: data.requirements,
        tags: data.tags ?? [],
        version: data.version ?? '',
        status: data.status ?? ProductStatus.draft,
        accessLevel: data.accessLevel ?? ProductAccessLevel.public,
        licenseType: data.licenseType ?? ProductLicenseType.free,
        environment: data.environment,
        framework: data.framework,
        modelType: data.modelType,
        createdBy: data.createdBy,
        earningsSplit: data.earningsSplit ?? 0.7,
        isPublic: data.isPublic ?? true,
        uploadedBy: data.uploadedBy,
      },
    }).then(toProduct);
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
      updateData.price = data.price;
    }
    if (data.earningsSplit !== undefined) {
      updateData.earningsSplit = data.earningsSplit;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.accessLevel !== undefined) {
      updateData.accessLevel = data.accessLevel;
    }
    if (data.licenseType !== undefined) {
      updateData.licenseType = data.licenseType;
    }
    return await prisma.product.update({
      where: { id },
      data: updateData,
    }).then(toProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
}

export async function getProducts(options: ProductOptions = {}): Promise<Product[]> {
  try {
    const where: Prisma.ProductWhereInput = {};
    if (options.category) where.category = options.category;
    if (options.minPrice) where.price = { gte: options.minPrice };
    if (options.maxPrice) where.price = { ...where.price, lte: options.maxPrice };
    if (options.status) where.status = options.status;
    if (options.query) {
      where.OR = [
        { name: { contains: options.query, mode: 'insensitive' } },
        { description: { contains: options.query, mode: 'insensitive' } },
      ];
    }
    return await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    }).then(products => products.map(toProduct));
  } catch (error) {
    console.error('Error getting products:', error);
    throw new Error('Failed to get products');
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    return await prisma.product.findUnique({
      where: { id },
    }).then(product => (product ? toProduct(product) : null));
  } catch (error) {
    console.error('Error getting product:', error);
    throw new Error('Failed to get product');
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await prisma.product.delete({
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
    const totalValue = products.reduce((sum, product) => sum + Number(product.price), 0);
    const averagePrice = totalValue / totalProducts;
    const priceDistribution = products.reduce((acc, product) => {
      const range = Math.floor(Number(product.price) / 100) * 100;
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
  product_id: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<any[]> {
  const where: Prisma.ReviewWhereInput = { productId: product_id };

  if (options.startDate) where.createdAt = { gte: options.startDate };
  if (options.endDate) where.createdAt = { lte: options.endDate };

  return await prisma.review.findMany({
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
  const review = await prisma.review.create({
    data: {
      productId: data.productId,
      userId: data.userId,
      rating: data.rating,
      comment: data.comment,
    },
  });

  await updateProductRating(data.productId);

  return review;
}

export async function updateProductRating(product_id: string): Promise<void> {
  const reviews = await prisma.review.findMany({
    where: { productId: product_id },
  });

  const average_rating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  await prisma.product.update({
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

  return await prisma.product.findMany({
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

  return await prisma.purchase.findMany({
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
  await prisma.product.update({
    where: { id: product_id },
    data: {
      downloadCount: {
        increment: 1,
      },
    },
  });
} 