import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { Product } from './schema';

export async function getProduct(id: string): Promise<Product | null> {
  return prisma.product.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function getProducts(options: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  limit?: number;
  offset?: number;
} = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    rating,
    limit = 10,
    offset = 0,
  } = options;

  const where: any = {};

  if (category) {
    where.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) {
      where.price.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      where.price.lte = maxPrice;
    }
  }

  if (rating !== undefined) {
    where.rating = {
      gte: rating,
    };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            purchases: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    pages: Math.ceil(total / limit),
  };
}

export async function getRelatedProducts(productId: string, category: string): Promise<Product[]> {
  return await prisma.product.findMany({
    where: {
      category,
      NOT: {
        id: productId,
      },
    },
    take: 4,
  });
}

export async function getProductReviews(productId: string): Promise<any[]> {
  return await prisma.review.findMany({
    where: {
      productId,
    },
    include: {
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createProductReview(data: {
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
}): Promise<any> {
  return await prisma.review.create({
    data: {
      productId: data.productId,
      userId: data.userId,
      rating: data.rating,
      comment: data.comment,
    },
    include: {
      user: true,
    },
  });
}

export async function updateProductRating(productId: string): Promise<void> {
  const reviews = await prisma.review.findMany({
    where: { productId },
  });

  const average_rating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: average_rating,
    },
  });
} 