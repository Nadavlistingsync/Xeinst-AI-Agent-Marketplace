import { prisma } from "./prisma";
import { Prisma, ProductStatus, ProductAccessLevel, ProductLicenseType } from '@prisma/client';
import type { Product } from '@/types/prisma';

export interface CreateProductInput {
  name: string;
  description: string;
  fileUrl: string;
  requirements: string[];
  longDescription?: string;
  price: number;
  category: string;
  tags: string[];
  version: string;
  status?: ProductStatus;
  accessLevel?: ProductAccessLevel;
  licenseType?: ProductLicenseType;
  environment: string;
  framework: string;
  modelType: string;
  createdBy: string;
  earningsSplit: number;
  isPublic?: boolean;
  uploadedBy?: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  fileUrl?: string;
  requirements?: string[];
  longDescription?: string;
  price?: number;
  category?: string;
  tags?: string[];
  version?: string;
  status?: ProductStatus;
  accessLevel?: ProductAccessLevel;
  licenseType?: ProductLicenseType;
  environment?: string;
  framework?: string;
  modelType?: string;
  earningsSplit?: number;
  isPublic?: boolean;
}

export async function createProduct(data: CreateProductInput): Promise<Product> {
  return prisma.product.create({
    data: {
      ...data,
      status: data.status || ProductStatus.draft,
      accessLevel: data.accessLevel || ProductAccessLevel.public,
      licenseType: data.licenseType || ProductLicenseType.free,
      isPublic: data.isPublic ?? true
    }
  });
}

export async function updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
  return prisma.product.update({
    where: { id },
    data
  });
}

export async function getProduct(id: string): Promise<Product | null> {
  return prisma.product.findUnique({
    where: { id }
  });
}

export async function getProducts(params?: {
  skip?: number;
  take?: number;
  where?: Prisma.ProductWhereInput;
  orderBy?: Prisma.ProductOrderByWithRelationInput;
}): Promise<Product[]> {
  return prisma.product.findMany({
    skip: params?.skip,
    take: params?.take,
    where: params?.where,
    orderBy: params?.orderBy
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({
    where: { id }
  });
}

export async function getProductsByUser(userId: string): Promise<Product[]> {
  return prisma.product.findMany({
    where: { createdBy: userId }
  });
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return prisma.product.findMany({
    where: { category }
  });
}

export async function getProductsByTag(tag: string): Promise<Product[]> {
  return prisma.product.findMany({
    where: {
      tags: {
        has: tag
      }
    }
  });
}

export async function getProductsByStatus(status: ProductStatus): Promise<Product[]> {
  return prisma.product.findMany({
    where: { status }
  });
}

export async function getProductsByAccessLevel(accessLevel: ProductAccessLevel): Promise<Product[]> {
  return prisma.product.findMany({
    where: { accessLevel }
  });
}

export async function getProductsByLicenseType(licenseType: ProductLicenseType): Promise<Product[]> {
  return prisma.product.findMany({
    where: { licenseType }
  });
}

export async function getProductsByEnvironment(environment: string): Promise<Product[]> {
  return prisma.product.findMany({
    where: { environment }
  });
}

export async function getProductsByFramework(framework: string): Promise<Product[]> {
  return prisma.product.findMany({
    where: { framework }
  });
}

export async function getProductsByModelType(modelType: string): Promise<Product[]> {
  return prisma.product.findMany({
    where: { modelType }
  });
}

export async function getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
  return prisma.product.findMany({
    where: {
      price: {
        gte: minPrice,
        lte: maxPrice
      }
    }
  });
}

export async function getProductsByRating(minRating: number): Promise<Product[]> {
  return prisma.product.findMany({
    where: {
      rating: {
        gte: minRating
      }
    }
  });
}

export async function getProductsByDownloadCount(minDownloads: number): Promise<Product[]> {
  return prisma.product.findMany({
    where: {
      downloadCount: {
        gte: minDownloads
      }
    }
  });
}

export async function getProductsByDateRange(startDate: Date, endDate: Date): Promise<Product[]> {
  return prisma.product.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });
}

export async function getProductsBySearchTerm(searchTerm: string): Promise<Product[]> {
  return prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { longDescription: { contains: searchTerm, mode: 'insensitive' } },
        { category: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { has: searchTerm } }
      ]
    }
  });
}

export async function getProductsByMultipleFilters(filters: {
  category?: string;
  tags?: string[];
  status?: ProductStatus;
  accessLevel?: ProductAccessLevel;
  licenseType?: ProductLicenseType;
  environment?: string;
  framework?: string;
  modelType?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  minDownloads?: number;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}): Promise<Product[]> {
  const where: Prisma.ProductWhereInput = {};

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.tags && filters.tags.length > 0) {
    where.tags = {
      hasEvery: filters.tags
    };
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.accessLevel) {
    where.accessLevel = filters.accessLevel;
  }

  if (filters.licenseType) {
    where.licenseType = filters.licenseType;
  }

  if (filters.environment) {
    where.environment = filters.environment;
  }

  if (filters.framework) {
    where.framework = filters.framework;
  }

  if (filters.modelType) {
    where.modelType = filters.modelType;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      where.price.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = filters.maxPrice;
    }
  }

  if (filters.minRating !== undefined) {
    where.rating = {
      gte: filters.minRating
    };
  }

  if (filters.minDownloads !== undefined) {
    where.downloadCount = {
      gte: filters.minDownloads
    };
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  if (filters.searchTerm) {
    where.OR = [
      { name: { contains: filters.searchTerm, mode: 'insensitive' } },
      { description: { contains: filters.searchTerm, mode: 'insensitive' } },
      { longDescription: { contains: filters.searchTerm, mode: 'insensitive' } },
      { category: { contains: filters.searchTerm, mode: 'insensitive' } },
      { tags: { has: filters.searchTerm } }
    ];
  }

  return prisma.product.findMany({
    where
  });
} 