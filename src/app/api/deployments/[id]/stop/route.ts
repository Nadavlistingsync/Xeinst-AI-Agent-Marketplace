import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DeploymentStatus } from '@prisma/client';
import { broadcastDeploymentStatus } from '@/lib/websocket';

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
    broadcastDeploymentStatus({
      id: deployment.id,
      status: deployment.status,
      metrics: deployment.metrics,
      lastUpdated: new Date().toISOString()
    });

    return NextResponse.json(deployment);
  } catch (error) {
    console.error('Error stopping deployment:', error);
    return NextResponse.json(
      { error: 'Failed to stop deployment' },
      { status: 500 }
    );
  }
} 