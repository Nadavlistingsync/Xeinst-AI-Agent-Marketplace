import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DeploymentStatus } from '@prisma/client';
import { broadcastDeploymentStatus } from '@/lib/websocket';
import { type DeploymentStatusUpdate } from '@/types/websocket';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First stop the deployment
    await prisma.deployment.update({
      where: { id: params.id },
      data: { status: DeploymentStatus.stopped }
    });

    // Then start it again
    const deployment = await prisma.deployment.update({
      where: { id: params.id },
      data: { status: DeploymentStatus.active },
      include: {
        metrics: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    // Get the latest metrics
    const latestMetrics = deployment.metrics[0];

    // Broadcast the status update
    const statusUpdate: DeploymentStatusUpdate = {
      id: deployment.id,
      status: 'active',
      metrics: latestMetrics ? {
        errorRate: latestMetrics.errorRate || 0,
        successRate: latestMetrics.successRate || 0,
        activeUsers: latestMetrics.activeUsers || 0,
        totalRequests: latestMetrics.totalRequests || 0,
        averageResponseTime: latestMetrics.averageResponseTime || 0,
        requestsPerMinute: latestMetrics.requestsPerMinute || 0,
        averageTokensUsed: latestMetrics.averageTokensUsed || 0,
        costPerRequest: latestMetrics.costPerRequest || 0,
        totalCost: latestMetrics.totalCost || 0
      } : undefined,
      lastUpdated: new Date().toISOString()
    };
    broadcastDeploymentStatus(statusUpdate);

    return NextResponse.json(deployment);
  } catch (error) {
    console.error('Error restarting deployment:', error);
    return NextResponse.json(
      { error: 'Failed to restart deployment' },
      { status: 500 }
    );
  }
} 