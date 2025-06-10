import { prisma } from './prisma';

export interface Deployment {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'pending' | 'failed';
  version: string;
  environment: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getDeployments(): Promise<Deployment[]> {
  const deployments = await prisma.deployment.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  return deployments.map(deployment => ({
    id: deployment.id,
    name: deployment.name,
    description: deployment.description || '',
    status: deployment.status as 'active' | 'pending' | 'failed',
    version: deployment.version,
    environment: deployment.environment,
    createdAt: deployment.createdAt,
    updatedAt: deployment.updatedAt
  }));
} 