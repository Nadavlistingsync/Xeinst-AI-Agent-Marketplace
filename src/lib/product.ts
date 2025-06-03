import { PrismaClient, Prisma } from '@prisma/client';
import { Product } from './schema';
import { Product as PrismaProduct, ProductStatus, ProductAccessLevel, ProductLicenseType } from '@prisma/client';

const prisma = new PrismaClient();

export type CreateProductInput = {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  createdBy: string;
  imageUrl?: string;
  status?: 'draft' | 'published' | 'archived';
};

export type UpdateProductInput = {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  imageUrl?: string;
  status?: 'draft' | 'published' | 'archived';
};

export type ProductFilter = {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: 'draft' | 'published' | 'archived';
  search?: string;
};

function toProduct(obj: PrismaProduct): Product {
  return {
    ...obj,
    price: Number(obj.price),
    earningsSplit: Number(obj.earningsSplit),
  };
}

export async function createProduct(data: CreateProductInput) {
  return prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      categoryId: data.categoryId,
      createdBy: data.createdBy,
      imageUrl: data.imageUrl,
      status: data.status || 'draft'
    }
  }).then(toProduct);
}

export async function updateProduct(id: string, data: UpdateProductInput) {
  return prisma.product.update({
    where: { id },
    data
  }).then(toProduct);
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      creator: true,
      reviews: {
        include: {
          user: true
        }
      }
    }
  }).then(product => (product ? toProduct(product) : null));
}

export async function getProducts(filter: ProductFilter = {}) {
  const where: Prisma.ProductWhereInput = {
    status: filter.status || 'published'
  };

  if (filter.categoryId) {
    where.categoryId = filter.categoryId;
  }

  if (filter.minPrice || filter.maxPrice) {
    where.price = {
      ...(filter.minPrice && { gte: filter.minPrice }),
      ...(filter.maxPrice && { lte: filter.maxPrice })
    };
  }

  if (filter.search) {
    where.OR = [
      { name: { contains: filter.search, mode: 'insensitive' } },
      { description: { contains: filter.search, mode: 'insensitive' } }
    ];
  }

  return prisma.product.findMany({
    where,
    include: {
      category: true,
      creator: true,
      _count: {
        select: {
          reviews: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  }).then(products => products.map(toProduct));
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
      comment: data.comment || '',
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