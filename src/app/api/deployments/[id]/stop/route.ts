import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DeploymentStatus } from '@prisma/client';
import { broadcastDeploymentStatus } from '@/lib/websocket';
import { type DeploymentStatusUpdate } from '@/types/websocket';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deployment = await prisma.deployment.update({
      where: { id: params.id },
      data: { status: DeploymentStatus.stopped },
      include: {
        metrics: true
      }
    });

    // Broadcast the status update
    const statusUpdate: DeploymentStatusUpdate = {
      id: deployment.id,
      status: 'stopped',
      metrics: deployment.metrics?.[0] ? {
        errorRate: deployment.metrics[0].errorRate || 0,
        successRate: deployment.metrics[0].successRate || 0,
        activeUsers: deployment.metrics[0].activeUsers || 0,
        totalRequests: deployment.metrics[0].totalRequests || 0,
        averageResponseTime: deployment.metrics[0].averageResponseTime || 0,
        requestsPerMinute: deployment.metrics[0].requestsPerMinute || 0,
        averageTokensUsed: deployment.metrics[0].averageTokensUsed || 0,
        costPerRequest: deployment.metrics[0].costPerRequest || 0,
        totalCost: deployment.metrics[0].totalCost || 0
      } : undefined
    };
    broadcastDeploymentStatus(statusUpdate);

    return NextResponse.json(deployment);
  } catch (error) {
    console.error('Error stopping deployment:', error);
    return NextResponse.json(
      { error: 'Failed to stop deployment' },
      { status: 500 }
    );
  }
} 