import { Prisma } from '@prisma/client';
import prismaClient from './db';
import { Product } from './schema';
import { prisma } from './db';

export async function getProduct(slug: string): Promise<Product | null> {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      uploader: {
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
        orderBy: {
          created_at: 'desc',
        },
      },
    },
  });
}

export async function getProducts(options: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  isPublic?: boolean;
  isFeatured?: boolean;
  limit?: number;
  offset?: number;
} = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    rating,
    isPublic,
    isFeatured,
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
    where.average_rating = {
      gte: rating,
    };
  }

  if (isPublic !== undefined) {
    where.isPublic = isPublic;
  }

  if (isFeatured !== undefined) {
    where.isFeatured = isFeatured;
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
        uploader: {
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
      orderBy: {
        created_at: 'desc',
      },
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

export async function getRelatedProducts(product_id: string, category: string): Promise<Product[]> {
  return await prismaClient.product.findMany({
    where: {
      category: {
        name: category,
      },
      NOT: {
        id: product_id,
      },
    },
    take: 4,
    include: {
      category: true,
      seller: true,
    },
  });
}

export async function getProductReviews(product_id: string): Promise<any[]> {
  return await prismaClient.review.findMany({
    where: {
      product_id,
    },
    include: {
      user: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });
}

export async function createProductReview(data: {
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
}): Promise<any> {
  return await prismaClient.review.create({
    data,
    include: {
      user: true,
    },
  });
}

export async function updateProductRating(product_id: string): Promise<void> {
  const reviews = await prismaClient.review.findMany({
    where: { product_id },
  });

  const average_rating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  await prismaClient.product.update({
    where: { id: product_id },
    data: {
      rating: average_rating,
    },
  });
} 