import { prisma } from './db';
import { Prisma } from '@prisma/client';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function createCategory(data: {
  name: string;
  description?: string;
  parentId?: string;
}): Promise<Category> {
  return await prisma.category.create({
    data: {
      name: data.name,
      description: data.description,
      parentId: data.parentId
    }
  });
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    description?: string;
    parentId?: string;
  }
): Promise<Category> {
  return await prisma.category.update({
    where: { id },
    data
  });
}

export async function getCategories(options: {
  parentId?: string | null;
  search?: string;
} = {}): Promise<Category[]> {
  const where: Prisma.CategoryWhereInput = {};

  if (options.parentId !== undefined) {
    where.parentId = options.parentId;
  }

  if (options.search) {
    where.OR = [
      { name: { contains: options.search, mode: 'insensitive' } },
      { description: { contains: options.search, mode: 'insensitive' } }
    ];
  }

  return await prisma.category.findMany({
    where,
    orderBy: { name: 'asc' }
  });
}

export async function getCategory(id: string): Promise<Category | null> {
  return await prisma.category.findUnique({
    where: { id }
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await prisma.category.delete({
    where: { id }
  });
}

export async function getCategoryStats(categoryId: string) {
  try {
    const products = await prisma.product.findMany({
      where: { category: categoryId },
    });

    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + Number(product.price), 0);
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

  // First pass: Create all nodes
  categories.forEach(category => {
    hierarchy[category.id] = {
      ...category,
      children: []
    };
  });

  // Second pass: Build the tree
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
): Promise<any[]> {
  const where: Prisma.ProductWhereInput = { category: categoryId };

  if (options.minPrice) where.price = { gte: options.minPrice };
  if (options.maxPrice) where.price = { lte: options.maxPrice };

  return await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit,
  });
}

export async function getCategoryPath(id: string): Promise<Category[]> {
  const path: Category[] = [];
  let currentCategory = await getCategory(id);

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