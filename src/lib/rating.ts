import { prisma } from '../types/prisma';
import type { Rating, Prisma } from '@prisma/client';

export interface CreateRatingInput {
  userId: string;
  productId?: string;
  deploymentId?: string;
  score: number;
  comment?: string;
}

export interface UpdateRatingInput {
  score?: number;
  comment?: string;
}

export async function createRating(data: CreateRatingInput): Promise<Rating> {
  return prisma.rating.create({
    data: {
      ...data,
      score: Number(data.score)
    }
  });
}

export async function updateRating(id: string, data: UpdateRatingInput): Promise<Rating> {
  return prisma.rating.update({
    where: { id },
    data: {
      ...data,
      score: data.score ? Number(data.score) : undefined
    }
  });
}

export async function getRating(id: string): Promise<Rating | null> {
  return prisma.rating.findUnique({
    where: { id }
  });
}

export async function getRatings(params?: {
  skip?: number;
  take?: number;
  where?: Prisma.RatingWhereInput;
  orderBy?: Prisma.RatingOrderByWithRelationInput;
}): Promise<Rating[]> {
  return prisma.rating.findMany({
    skip: params?.skip,
    take: params?.take,
    where: params?.where,
    orderBy: params?.orderBy
  });
}

export async function deleteRating(id: string): Promise<void> {
  await prisma.rating.delete({
    where: { id }
  });
}

export async function getRatingsByUser(userId: string): Promise<Rating[]> {
  return prisma.rating.findMany({
    where: { userId }
  });
}

export async function getRatingsByProduct(productId: string): Promise<Rating[]> {
  return prisma.rating.findMany({
    where: { productId }
  });
}

export async function getRatingsByDeployment(deploymentId: string): Promise<Rating[]> {
  return prisma.rating.findMany({
    where: { deploymentId }
  });
}

export async function getAverageRating(params: {
  productId?: string;
  deploymentId?: string;
}): Promise<number> {
  const result = await prisma.rating.aggregate({
    where: params,
    _avg: {
      score: true
    }
  });

  return result._avg.score || 0;
}

export async function getRatingStats(params: {
  productId?: string;
  deploymentId?: string;
}): Promise<{
  average: number;
  count: number;
  distribution: Record<number, number>;
}> {
  const ratings = await prisma.rating.findMany({
    where: params
  });

  const distribution: Record<number, number> = {};
  let sum = 0;

  ratings.forEach(rating => {
    const score = Math.round(rating.score);
    distribution[score] = (distribution[score] || 0) + 1;
    sum += rating.score;
  });

  return {
    average: ratings.length > 0 ? sum / ratings.length : 0,
    count: ratings.length,
    distribution
  };
} 