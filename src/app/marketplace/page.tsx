import { Metadata } from "next";
import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";
import { MarketplaceFilters } from "@/components/marketplace/MarketplaceFilters";
import { MarketplaceSearch } from "@/components/marketplace/MarketplaceSearch";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Marketplace | Browse and Deploy AI Agents",
  description: "Browse our collection of AI agents and products. Deploy, customize, and integrate AI solutions for your business needs.",
};

export default function MarketplacePage({
  searchParams,
}: {
  searchParams: {
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
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">AI Marketplace</h1>
          <p className="text-lg text-gray-600">
            Discover and deploy powerful AI agents and solutions
          </p>
        </div>
        <Button asChild>
          <Link href="/deploy/new" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Deploy New Agent
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <MarketplaceFilters />
        </div>
        
        <div className="lg:col-span-3">
          <div className="mb-6">
            <MarketplaceSearch />
          </div>
          
          <MarketplaceGrid searchParams={searchParams} />
        </div>
      </div>
    </div>
  );
} 