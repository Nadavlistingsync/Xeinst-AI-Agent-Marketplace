import { prisma } from './db';
import { Prisma } from '@prisma/client';
import { Category } from './schema';

export async function createCategory(data: {
  name: string;
  description: string;
  parentId?: string;
}): Promise<Category> {
  try {
    return await prisma.category.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error creating category:', error);
    throw new Error('Failed to create category');
  }
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  try {
    return await prisma.category.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating category:', error);
    throw new Error('Failed to update category');
  }
}

export async function getCategories(options: {
  parentId?: string;
  search?: string;
} = {}): Promise<Category[]> {
  try {
    const where: Prisma.CategoryWhereInput = {};
    
    if (options.parentId) where.parentId = options.parentId;
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    throw new Error('Failed to get categories');
  }
}

export async function getCategory(id: string): Promise<Category | null> {
  try {
    return await prisma.category.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error getting category:', error);
    throw new Error('Failed to get category');
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await prisma.category.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error('Failed to delete category');
  }
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

export async function getCategoryHierarchy() {
  try {
    const categories = await getCategories();
    const hierarchy: Record<string, { category: Category; children: Category[] }> = {};

    // First, create entries for all categories
    categories.forEach(category => {
      hierarchy[category.id] = {
        category,
        children: [],
      };
    });

    // Then, build the hierarchy
    categories.forEach(category => {
      if (category.parentId && hierarchy[category.parentId]) {
        hierarchy[category.parentId].children.push(category);
      }
    });

    // Return only root categories with their children
    return Object.values(hierarchy).filter(
      ({ category }) => !category.parentId
    );
  } catch (error) {
    console.error('Error getting category hierarchy:', error);
    throw new Error('Failed to get category hierarchy');
  }
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