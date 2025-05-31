import { Prisma } from '@prisma/client';
import prismaClient from './db';
import { Category } from './schema';

export interface CategoryOptions {
  parentId?: string;
  query?: string;
}

export async function createCategory(data: {
  name: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
}): Promise<Category> {
  return await prismaClient.category.create({
    data,
  });
}

export async function updateCategory(
  id: string,
  data: Partial<Category>
): Promise<Category> {
  return await prismaClient.category.update({
    where: { id },
    data,
  });
}

export async function getCategories(
  options: CategoryOptions = {}
): Promise<Category[]> {
  const where: Prisma.CategoryWhereInput = {};

  if (options.parentId) where.parentId = options.parentId;
  if (options.query) {
    where.OR = [
      { name: { contains: options.query, mode: 'insensitive' } },
      { description: { contains: options.query, mode: 'insensitive' } },
    ];
  }

  return await prismaClient.category.findMany({
    where,
    include: {
      parent: true,
      children: true,
    },
    orderBy: { name: 'asc' },
  });
}

export async function getCategory(id: string): Promise<Category | null> {
  return await prismaClient.category.findUnique({
    where: { id },
    include: {
      parent: true,
      children: true,
    },
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await prismaClient.category.delete({
    where: { id },
  });
}

export async function getCategoryProducts(
  categoryId: string,
  options: {
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
  } = {}
): Promise<any[]> {
  const where: Prisma.ProductWhereInput = { category: categoryId };

  if (options.minPrice) where.price = { gte: options.minPrice };
  if (options.maxPrice) where.price = { lte: options.maxPrice };

  return await prismaClient.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
}

export async function getCategoryStats(categoryId: string): Promise<{
  totalProducts: number;
  averagePrice: number;
  totalSales: number;
  productDistribution: Record<string, number>;
}> {
  const products = await prismaClient.product.findMany({
    where: { category: categoryId },
  });

  const totalProducts = products.length;
  const averagePrice =
    products.reduce((sum, product) => sum + product.price, 0) / totalProducts;

  const purchases = await prismaClient.purchase.findMany({
    where: {
      product: {
        category: categoryId,
      },
    },
  });

  const totalSales = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

  const productDistribution = products.reduce((acc, product) => {
    const date = product.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalProducts,
    averagePrice,
    totalSales,
    productDistribution,
  };
}

export async function getCategoryTree(): Promise<Category[]> {
  return await prismaClient.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          children: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getCategoryPath(categoryId: string): Promise<Category[]> {
  const path: Category[] = [];
  let currentCategory = await getCategory(categoryId);

  while (currentCategory) {
    path.unshift(currentCategory);
    if (currentCategory.parentId) {
      currentCategory = await getCategory(currentCategory.parentId);
    } else {
      break;
    }
  }

  return path;
} 