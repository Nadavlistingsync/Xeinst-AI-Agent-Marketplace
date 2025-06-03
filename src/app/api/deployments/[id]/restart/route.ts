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
        metrics: true
      }
    });

    // Broadcast the status update
    const statusUpdate: DeploymentStatusUpdate = {
      id: deployment.id,
      status: 'active',
      metrics: deployment.metrics,
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