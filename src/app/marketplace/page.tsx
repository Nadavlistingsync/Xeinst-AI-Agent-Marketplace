import { Metadata } from "next";
import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";
import { MarketplaceFilters } from "@/components/marketplace/MarketplaceFilters";
import { MarketplaceSearch } from "@/components/marketplace/MarketplaceSearch";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import Link from "next/link";
import { Agent } from "@/app/api/agents/route";

export const metadata: Metadata = {
  title: "Xeinst Agent Marketplace",
  description: "Browse our collection of AI agents, and run them directly from the browser.",
};

async function getAgents(): Promise<Agent[]> {
  // In a real app, you might have this on the server if the API is internal,
  // or you'd fetch from the absolute URL if it's external.
  // For this example, we fetch from the API route.
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/agents`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch agents');
  }
  return res.json();
}

export default async function MarketplacePage() {
  const agents = await getAgents();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Xeinst Agent Marketplace</h1>
          <p className="text-lg text-gray-600">
            Discover and run powerful AI agents directly from your browser
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Agent
            </Link>
          </Button>
          <Button asChild>
            <Link href="/deploy" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Deploy Agent
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <MarketplaceFilters />
        </div>
        
        <div className="lg:col-span-3">
          <div className="mb-6">
            <MarketplaceSearch />
          </div>
          
          <MarketplaceGrid agents={agents} />
        </div>
      </div>
    </div>
  );
} 