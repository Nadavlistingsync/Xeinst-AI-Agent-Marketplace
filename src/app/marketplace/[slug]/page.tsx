import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDeploymentById } from "@/lib/db-helpers";
import { AgentDetails } from "@/components/marketplace/AgentDetails";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Suspense } from "react";
import { useSession } from 'next-auth/react';
import { Star } from 'lucide-react';
import Image from 'next/image';
import AgentReviews from '@/components/AgentReviews';
import { toast } from 'react-hot-toast';

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

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<LoadingSpinner />}>
        <AgentDetails deployment={deployment} />
      </Suspense>
    </div>
  );
} 