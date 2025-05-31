import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { AgentCard } from '@/components/marketplace/AgentCard';
import { SearchBar } from '@/components/marketplace/SearchBar';
import { FilterBar } from '@/components/marketplace/FilterBar';
import { getDeployments } from '@/lib/agent-deployment';
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
  const { query, framework, access_level } = searchParams;

  const deployments = await getDeployments({
    where: {
      OR: query
        ? [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ]
        : undefined,
      access_level: access_level || "public",
      framework: framework,
    },
    orderBy: { created_at: "desc" },
    include: {
      deployer: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  const agents = deployments.map((agent) => ({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    framework: agent.framework,
    environment: agent.environment,
    status: agent.status,
    rating: Number(agent.rating),
    ratingCount: agent.ratingCount || 0,
    download_count: agent.download_count,
    priceCents: agent.priceCents,
    access_level: agent.access_level,
    licenseType: agent.licenseType,
    access_level: agent.access_level as "public" | "basic" | "premium",
    licenseType: agent.licenseType as "full-access" | "limited-use" | "view-only" | "non-commercial",
    deployer: {
      id: agent.deployer.id,
      name: agent.deployer.name ?? "",
      email: agent.deployer.email,
      image: agent.deployer.image,
    },
    created_at: agent.created_at,
    updated_at: agent.updated_at,
    apiEndpoint: agent.apiEndpoint,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">AI Agent Marketplace</h1>
        <p className="text-gray-600">
          Discover and deploy powerful AI agents for your business needs
        </p>
      </div>

      <div className="mb-8">
        <SearchBar />
      </div>

      <div className="mb-8">
        <FilterBar />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Suspense fallback={<div>Loading agents...</div>}>
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </Suspense>
      </div>
    </div>
  );
} 