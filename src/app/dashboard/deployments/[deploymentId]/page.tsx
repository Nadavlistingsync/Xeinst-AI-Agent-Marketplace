import { Metadata } from "next";
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DeploymentOverview } from '@/components/dashboard/DeploymentOverview';
import { DeploymentMetrics } from "@/components/dashboard/DeploymentMetrics";
import { DeploymentLogs } from "@/components/dashboard/DeploymentLogs";
import { DeploymentWithMetrics } from '@/types/deployment';
import { DeploymentStatus } from '@prisma/client';
import { Suspense } from 'react';
import type { DeploymentStatus as PrismaDeploymentStatus } from '@/types/prisma';

interface DeploymentPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: DeploymentPageProps): Promise<Metadata> {
  const deployment = await prisma.deployment.findUnique({
    where: { id: params.id },
    include: {
      metrics: true,
      feedbacks: {
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        }
      }
    }
  });
  
  if (!deployment) {
    return {
      title: "Deployment Not Found",
    };
  }

  return {
    title: `${deployment.name} | Deployment Details`,
    description: `Manage and monitor your ${deployment.name} deployment`,
  };
}

export default async function DeploymentPage({ params }: DeploymentPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const deployment = await prisma.deployment.findUnique({
    where: { id: params.id },
    include: {
      metrics: true,
      feedbacks: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
              email: true
            }
          }
        }
      }
    }
  });

  if (!deployment) {
    redirect("/dashboard");
  }

  if (deployment.deployedBy !== session.user.id) {
    redirect("/dashboard");
  }

  // Transform the deployment data to match DeploymentWithMetrics type
  const deploymentWithMetrics: DeploymentWithMetrics = {
    id: deployment.id,
    name: deployment.name,
    status: deployment.status as DeploymentStatus,
    description: deployment.description || '',
    accessLevel: deployment.accessLevel,
    licenseType: deployment.licenseType,
    environment: deployment.environment,
    framework: deployment.framework,
    modelType: deployment.modelType,
    source: deployment.source || '',
    deployedBy: deployment.deployedBy,
    createdBy: deployment.createdBy,
    rating: deployment.rating || 0,
    totalRatings: deployment.totalRatings || 0,
    downloadCount: deployment.downloadCount || 0,
    startDate: deployment.startDate || new Date(),
    createdAt: deployment.createdAt,
    updatedAt: deployment.updatedAt,
    isPublic: deployment.isPublic,
    version: deployment.version || '1.0.0',
    health: deployment.health || {},
    metrics: deployment.metrics.map(metric => ({
      id: metric.id,
      createdAt: metric.createdAt,
      updatedAt: metric.updatedAt,
      deploymentId: metric.deploymentId,
      errorRate: metric.errorRate,
      responseTime: metric.responseTime,
      successRate: metric.successRate,
      totalRequests: metric.totalRequests,
      activeUsers: metric.activeUsers,
      averageResponseTime: metric.averageResponseTime,
      requestsPerMinute: metric.requestsPerMinute,
      averageTokensUsed: metric.averageTokensUsed,
      costPerRequest: metric.costPerRequest,
      totalCost: metric.totalCost,
      lastUpdated: metric.lastUpdated
    })),
    feedbacks: deployment.feedbacks.map(feedback => ({
      id: feedback.id,
      rating: feedback.rating,
      comment: feedback.comment,
      sentimentScore: feedback.sentimentScore,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
      deploymentId: feedback.deploymentId,
      userId: feedback.userId,
      categories: feedback.categories,
      creatorResponse: feedback.creatorResponse,
      responseDate: feedback.responseDate,
      metadata: feedback.metadata,
      user: {
        name: feedback.user?.name || null,
        email: feedback.user?.email || null,
        image: feedback.user?.image || null
      }
    }))
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <DeploymentOverview 
            deployment={deploymentWithMetrics}
            onStart={async (id: string) => {
              "use server";
              await prisma.deployment.update({
                where: { id },
                data: { status: DeploymentStatus.active }
              });
            }}
            onStop={async (id: string) => {
              "use server";
              await prisma.deployment.update({
                where: { id },
                data: { status: DeploymentStatus.stopped }
              });
            }}
            onRestart={async (id: string) => {
              "use server";
              await prisma.deployment.update({
                where: { id },
                data: { status: DeploymentStatus.pending }
              });
              await prisma.deployment.update({
                where: { id },
                data: { status: DeploymentStatus.active }
              });
            }}
            onDelete={async (id: string) => {
              "use server";
              await prisma.deployment.delete({
                where: { id }
              });
            }}
          />
          <DeploymentMetrics 
            deploymentId={deployment.id} 
            socket={null} // We'll handle socket connection in the component
          />
          <DeploymentLogs deploymentId={deployment.id} />
        </div>
        
        <div className="lg:col-span-1">
          {/* <DeploymentSettings deployment={deployment} /> */}
        </div>
      </div>
    </div>
  );
} 