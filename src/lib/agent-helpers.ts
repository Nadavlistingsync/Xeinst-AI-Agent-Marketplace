import { prisma } from './db';
import { Agent } from '@/types/agents';

export async function getFeaturedAgents(): Promise<Agent[]> {
  try {
    const agents = await prisma.agent.findMany({
      where: { status: 'active' },
      orderBy: { downloadCount: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as Agent[];
    return agents;
  } catch (error) {
    console.error('Error fetching featured agents:', error);
    return [];
  }
}

export async function getTrendingAgents(): Promise<Agent[]> {
  try {
    const agents = await prisma.agent.findMany({
      where: { status: 'active' },
      orderBy: { rating: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as Agent[];
    return agents;
  } catch (error) {
    console.error('Error fetching trending agents:', error);
    return [];
  }
} 