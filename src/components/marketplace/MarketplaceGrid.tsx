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

// Add a type for the deployment object used in AgentCard
interface MarketplaceDeployment {
  id: string;
  name: string;
  status: "pending" | "deploying" | "active" | "failed" | "stopped";
  description: string;
  accessLevel: string;
  licenseType: string;
  environment: string;
  framework: string;
  modelType: string;
  createdAt: Date;
  updatedAt: Date;
  // Add more fields here if your backend returns them
}

async function AgentGrid({ searchParams }: MarketplaceGridProps) {
  const deployments: MarketplaceDeployment[] = await getDeployments({
    query: searchParams?.query,
    framework: searchParams?.framework,
  });

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