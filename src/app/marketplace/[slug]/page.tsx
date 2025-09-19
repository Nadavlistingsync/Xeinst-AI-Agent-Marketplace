import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDeploymentById } from "../../../lib/db-helpers";
import AgentDetails from "../../../components/marketplace/AgentDetails";

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

  // Transform deployment to agent format
  const agent = {
    id: deployment.id,
    name: deployment.name,
    description: deployment.description || '',
    category: deployment.framework || 'General', // Use framework as category fallback
    price: deployment.price || 0,
    rating: deployment.rating || 0,
    downloadCount: deployment.downloadCount || 0,
    creator: {
      name: deployment.deployedBy || 'Anonymous',
      image: undefined
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AgentDetails agent={agent} />
    </div>
  );
} 