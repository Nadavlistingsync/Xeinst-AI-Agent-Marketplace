import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDeploymentById } from "@/lib/db-helpers";
import { AgentDetails } from "@/components/marketplace/AgentDetails";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Suspense } from "react";
import { Deployment } from "@/types/deployment";

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
    ...deployment,
    category: deployment.category || '',
    endDate: deployment.endDate || null,
    tags: deployment.tags || [],
    earningsSplit: deployment.earningsSplit || 0,
    rating: deployment.rating || 0,
    totalRatings: deployment.totalRatings || 0,
    downloadCount: deployment.downloadCount || 0,
    source: deployment.source || '',
    deployedBy: deployment.deployedBy || '',
    createdBy: deployment.createdBy || '',
    startDate: deployment.startDate || new Date(),
    isPublic: deployment.isPublic || false,
    version: deployment.version || '1.0.0',
    health: deployment.health || null
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<LoadingSpinner />}>
        <AgentDetails deployment={deploymentWithRequiredFields} />
      </Suspense>
    </div>
  );
} 