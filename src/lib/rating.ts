import { prisma } from './db';
import type { Rating } from '@/types/prisma';

interface RatingWithNumber extends Omit<Rating, 'score'> {
  score: number;
}

export async function getRatingById(id: string): Promise<RatingWithNumber | null> {
  return prisma.rating.findUnique({
    where: {
      id
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      product: true
    }
  }).then(rating => rating ? { ...rating, score: Number(rating.score) } : null);
}

export async function getRatingsByUser(userId: string): Promise<RatingWithNumber[]> {
  return prisma.rating.findMany({
    where: {
      userId
    },
    include: {
      product: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  }).then(ratings => ratings.map(r => ({ ...r, score: Number(r.score) })));
}

export async function getRatingsByProduct(productId: string): Promise<RatingWithNumber[]> {
  return prisma.rating.findMany({
    where: {
      productId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  }).then(ratings => ratings.map(r => ({ ...r, score: Number(r.score) })));
}

export async function getAverageRating(productId: string): Promise<number> {
  const result = await prisma.rating.aggregate({
    where: {
      productId
    },
    _avg: {
      score: true
    }
  });
  return result._avg.score ? Number(result._avg.score) : 0;
} 