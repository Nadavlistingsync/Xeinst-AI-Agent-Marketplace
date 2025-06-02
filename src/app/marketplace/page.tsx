import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { AgentCard } from '@/components/marketplace/AgentCard';
import { SearchBar } from '@/components/marketplace/SearchBar';
import { FilterBar } from '@/components/marketplace/FilterBar';
import { getDeployments } from '@/lib/db-helpers';
import { Suspense } from "react";
import { Deployment } from "@prisma/client";

interface MarketplacePageProps {
  searchParams: {
    query?: string;
    framework?: string;
    access_level?: string;
  };
}

export const metadata: Metadata = {
  title: 'Marketplace - Xeinst',
  description: 'Discover and download AI agents',
};

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const deployments = await getDeployments({
    query: searchParams.query,
    framework: searchParams.framework,
    access_level: searchParams.access_level
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">AI Agent Marketplace</h1>
        </div>
        
        <div className="flex flex-col gap-4">
          <SearchBar />
          <FilterBar />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deployments.map((deployment) => (
            <AgentCard key={deployment.id} deployment={deployment} />
          ))}
        </div>
      </div>
    </div>
  );
} 