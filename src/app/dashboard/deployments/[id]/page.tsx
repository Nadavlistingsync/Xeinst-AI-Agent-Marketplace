import { Metadata } from "next";
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DeploymentOverview from '@/components/dashboard/DeploymentOverview';
import { DeploymentMetrics } from "@/components/dashboard/DeploymentMetrics";
import { DeploymentLogs } from "@/components/dashboard/DeploymentLogs";
import { DeploymentWithMetrics } from '@/types/deployment';
import { DeploymentStatus } from '@prisma/client';

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
              image: true
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
    ...deployment,
    status: deployment.status as DeploymentStatus,
    metrics: deployment.metrics || [],
    feedbacks: deployment.feedbacks.map(feedback => ({
      ...feedback,
      sentimentScore: feedback.sentimentScore || 0,
      categories: feedback.categories as Record<string, number> | null
    }))
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <DeploymentOverview 
            deployment={deploymentWithMetrics}
            onStart={async (id) => {
              "use server";
              await prisma.deployment.update({
                where: { id },
                data: { status: DeploymentStatus.ACTIVE }
              });
            }}
            onStop={async (id) => {
              "use server";
              await prisma.deployment.update({
                where: { id },
                data: { status: DeploymentStatus.STOPPED }
              });
            }}
            onRestart={async (id) => {
              "use server";
              await prisma.deployment.update({
                where: { id },
                data: { status: DeploymentStatus.PENDING }
              });
              await new Promise(resolve => setTimeout(resolve, 1000));
              await prisma.deployment.update({
                where: { id },
                data: { status: DeploymentStatus.ACTIVE }
              });
            }}
            onDelete={async (id) => {
              "use server";
              await prisma.deployment.delete({
                where: { id }
              });
            }}
          />
          <DeploymentMetrics deploymentId={deployment.id} />
          <DeploymentLogs deploymentId={deployment.id} />
        </div>
        
        <div className="lg:col-span-1">
          {/* <DeploymentSettings deployment={deployment} /> */}
        </div>
      </div>
    </div>
  );
} 