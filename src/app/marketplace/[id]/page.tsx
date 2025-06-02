import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDeploymentById } from "@/lib/db-helpers";
import { AgentDetails } from "@/components/marketplace/AgentDetails";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Suspense } from "react";

interface AgentPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: AgentPageProps): Promise<Metadata> {
  const deployment = await getDeploymentById(params.id);
  
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

export default async function AgentPage({ params }: AgentPageProps) {
  const deployment = await getDeploymentById(params.id);

  if (!deployment) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<LoadingSpinner />}>
        <AgentDetails deployment={deployment} />
      </Suspense>
    </div>
  );
} 