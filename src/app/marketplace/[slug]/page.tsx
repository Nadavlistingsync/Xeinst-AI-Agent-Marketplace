import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDeploymentById } from "@/lib/db-helpers";
import { AgentDetails } from "@/components/marketplace/AgentDetails";
import { Deployment } from "@/types/deployment";
import { DeploymentStatus } from "@prisma/client";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const deployment = await getDeploymentById(params.slug);
  
  if (!deployment) {
    return {
      title: "Agent Not Found",
    };
  }

  return {
    title: `${deployment.name} | AI Agent`,
    description: deployment.description,
  };
}

export default async function MarketplaceDetailPage({ params }: PageProps) {
  const deployment = await getDeploymentById(params.slug);

  if (!deployment) {
    notFound();
  }

  // Ensure deployment has all required fields for AgentDetails
  const deploymentWithRequiredFields: Deployment = {
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
    price: deployment.price || 0,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AgentDetails deployment={deploymentWithRequiredFields} />
    </div>
  );
} 