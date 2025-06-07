import { prisma } from './db';
import { Prisma, Product } from '../types/prisma';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// These functions are not valid since there is no productCategory model. Comment them out or remove them.
// export async function createCategory(name: string) { ... }
// export async function updateCategory(id: string, name: string) { ... }
// export async function getCategory(id: string): Promise<Category | null> { ... }
// export async function deleteCategory(id: string): Promise<void> { ... }

export async function getCategories(options: {
  parentId?: string | null;
  search?: string;
} = {}): Promise<Product[]> {
  const where: Prisma.ProductWhereInput = {};
  if (options.parentId !== undefined) {
    where.category = options.parentId as string;
  }
  if (options.search) {
    where.OR = [
      { name: { contains: options.search, mode: 'insensitive' } },
      { description: { contains: options.search, mode: 'insensitive' } }
    ];
  }
  return await prisma.product.findMany({
    where,
    orderBy: { name: 'asc' }
  });
}

export async function getCategoryStats(categoryId: string) {
  try {
    const products = await prisma.product.findMany({
      where: { category: categoryId },
    });
    const totalProducts = products.length;
    const totalValue = products.reduce((sum: number, product: Product) => sum + Number(product.price), 0);
    const averagePrice = totalProducts > 0 ? totalValue / totalProducts : 0;
    return {
      totalProducts,
      totalValue,
      averagePrice,
      recentProducts: products.slice(0, 5),
    };
  } catch (error) {
    console.error('Error getting category stats:', error);
    throw new Error('Failed to get category stats');
  }
}

export interface CategoryHierarchy extends Category {
  children: CategoryHierarchy[];
}

export function buildCategoryHierarchy(categories: Category[]): CategoryHierarchy[] {
  const hierarchy: Record<string, CategoryHierarchy> = {};
  const roots: CategoryHierarchy[] = [];
  categories.forEach(category => {
    hierarchy[category.id] = {
      ...category,
      children: []
    };
  });
  categories.forEach(category => {
    if (category.parentId && hierarchy[category.parentId]) {
      hierarchy[category.parentId].children.push(hierarchy[category.id]);
    } else {
      roots.push(hierarchy[category.id]);
    }
  });
  return roots;
}

export async function getCategoryProducts(
  categoryId: string,
  options: {
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
  } = {}
): Promise<Product[]> {
  const where: Prisma.ProductWhereInput = { category: categoryId };
  if (options.minPrice) where.price = { gte: options.minPrice };
  if (options.maxPrice) where.price = { lte: options.maxPrice };
  return await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
} 