import { prisma } from './db';
import type { Product } from '@/types/prisma';

interface ProductWithNumbers extends Omit<Product, 'price' | 'earningsSplit'> {
  price: number;
  earningsSplit: number;
}

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
  }).then(product => product ? { ...product, price: Number(product.price), earningsSplit: Number(product.earningsSplit) } : null);
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
    }).then(products => products.map(p => ({ ...p, price: Number(p.price), earningsSplit: Number(p.earningsSplit) }))),
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
  }).then(products => products.map(p => ({ ...p, price: Number(p.price), earningsSplit: Number(p.earningsSplit) })));
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
  comment: string;
  deploymentId: string;
}): Promise<any> {
  return await prisma.review.create({
    data: {
      productId: data.productId,
      userId: data.userId,
      rating: data.rating,
      comment: data.comment,
      deploymentId: data.deploymentId
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

export async function getProductById(id: string): Promise<ProductWithNumbers | null> {
  return prisma.product.findUnique({
    where: {
      id
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    }
  }).then(product => product ? { ...product, price: Number(product.price), earningsSplit: Number(product.earningsSplit) } : null);
}

export async function getProductsByCategory(category: string): Promise<ProductWithNumbers[]> {
  return prisma.product.findMany({
    where: {
      category,
      status: 'published'
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    }
  }).then(products => products.map(p => ({ ...p, price: Number(p.price), earningsSplit: Number(p.earningsSplit) })));
}

export async function getProductsByCreator(creatorId: string): Promise<ProductWithNumbers[]> {
  return prisma.product.findMany({
    where: {
      createdBy: creatorId
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    }
  }).then(products => products.map(p => ({ ...p, price: Number(p.price), earningsSplit: Number(p.earningsSplit) })));
}

export async function searchProducts(query: string): Promise<ProductWithNumbers[]> {
  return prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } }
      ],
      status: 'published'
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    }
  }).then(products => products.map(p => ({ ...p, price: Number(p.price), earningsSplit: Number(p.earningsSplit) })));
} 