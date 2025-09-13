import { prisma } from './db';
// import { Agent } from '../types/agents';
import { Deployment, DeploymentStatus } from '@prisma/client';

export async function getFeaturedAgents(): Promise<Deployment[]> {
  try {
    const agents = await prisma.deployment.findMany({
      where: { status: DeploymentStatus.active },
      orderBy: { downloadCount: 'desc' },
      take: 5,
    });
    return agents;
  } catch (error) {
    console.error('Error fetching featured agents:', error);
    return [];
  }
}

export async function getTrendingAgents(): Promise<Deployment[]> {
  try {
    const agents = await prisma.deployment.findMany({
      where: { status: DeploymentStatus.active },
      orderBy: { rating: 'desc' },
      take: 5,
    });
    return agents;
  } catch (error) {
    console.error('Error fetching trending agents:', error);
    return [];
  }
} 