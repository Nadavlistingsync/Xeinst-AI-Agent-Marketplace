import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDeploymentById } from "@/lib/db-helpers";
import { DeploymentOverview } from "@/components/dashboard/DeploymentOverview";
import { DeploymentMetrics } from "@/components/dashboard/DeploymentMetrics";
import { DeploymentLogs } from "@/components/dashboard/DeploymentLogs";
import { DeploymentSettings } from "@/components/dashboard/DeploymentSettings";

interface DeploymentPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: DeploymentPageProps): Promise<Metadata> {
  const deployment = await getDeploymentById(params.id);
  
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

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const deployment = await getDeploymentById(params.id);

  if (!deployment) {
    notFound();
  }

  // Check if user has access to view this deployment
  if (deployment.deployedBy !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <DeploymentOverview deployment={deployment} />
          <DeploymentMetrics deploymentId={deployment.id} />
          <DeploymentLogs deploymentId={deployment.id} />
        </div>
        
        <div className="lg:col-span-1">
          <DeploymentSettings deployment={deployment} />
        </div>
      </div>
    </div>
  );
} 