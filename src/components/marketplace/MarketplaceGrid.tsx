import { Suspense } from "react";
import { getDeployments } from "@/lib/db-helpers";
import { AgentCard } from "./AgentCard";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle } from "lucide-react";

interface MarketplaceGridProps {
  searchParams?: {
    query?: string;
    framework?: string;
    category?: string;
    accessLevel?: string;
    minPrice?: string;
    maxPrice?: string;
    verified?: string;
    popular?: string;
    new?: string;
  };
}

async function AgentGrid({ searchParams }: MarketplaceGridProps) {
  const deployments = await getDeployments(searchParams);

  if (deployments.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No agents found</AlertTitle>
        <AlertDescription>
          Try adjusting your search or filters to find what you're looking for.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {deployments.map((deployment) => (
        <AgentCard key={deployment.id} deployment={deployment} />
      ))}
    </div>
  );
}

export function MarketplaceGrid({ searchParams }: MarketplaceGridProps) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AgentGrid searchParams={searchParams} />
    </Suspense>
  );
} 