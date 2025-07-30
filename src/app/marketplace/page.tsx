"use client";

import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";
import { MarketplaceFilters } from "@/components/marketplace/MarketplaceFilters";
import { MarketplaceSearch } from "@/components/marketplace/MarketplaceSearch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Sparkles, Filter, Grid, List } from "lucide-react";
import Link from "next/link";
import { Agent } from "@/app/api/agents/route";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useEnhancedApiError } from "@/hooks/useEnhancedApiError";
import { EnhancedErrorDisplay } from "@/components/EnhancedErrorDisplay";

async function getAgents(): Promise<Agent[]> {
  // In a real app, you might have this on the server if the API is internal,
  // or you'd fetch from the absolute URL if it's external.
  // For this example, we fetch from the API route.
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/agents`, { cache: 'no-store' });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to fetch agents');
  }
  const data = await res.json();
  return data.agents || data; // Handle both new and old response formats
}

export default function MarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const { error, isRetrying, handleError, retryOperation, clearError } = useEnhancedApiError();

  const fetchAgents = async () => {
    try {
      setLoading(true);
      clearError();
      const agentsData = await getAgents();
      setAgents(agentsData);
    } catch (error) {
      handleError(error, { context: 'marketplace_fetch_agents' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleRetry = () => {
    retryOperation(fetchAgents, { context: 'marketplace_retry_fetch_agents' });
  };

  if (loading && !error) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ai-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading agents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <EnhancedErrorDisplay
            error={error}
            onRetry={handleRetry}
            onDismiss={clearError}
            showDetails={true}
            className="max-w-2xl mx-auto"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-dark">
        <div className="absolute inset-0 grid-bg opacity-10"></div>
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center space-x-2 mb-6">
              <Badge className="bg-ai-primary/20 text-ai-primary border-ai-primary/30 px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Agent Marketplace
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-gradient-animate">Discover</span> & Deploy
              <br />
              <span className="text-white">AI Agents</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Browse our curated collection of powerful AI agents. Test them instantly and deploy to your workflow.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="btn-primary text-lg px-8 py-4">
                <Link href="/upload" className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Agent
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <MarketplaceFilters />
            </div>

            {/* Main Grid */}
            <div className="lg:w-3/4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {agents.length} AI Agents Available
                  </h2>
                  <p className="text-muted-foreground">
                    Find the perfect agent for your needs
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Grid className="w-4 h-4 mr-2" />
                    Grid
                  </Button>
                  <Button variant="outline" size="sm">
                    <List className="w-4 h-4 mr-2" />
                    List
                  </Button>
                </div>
              </div>

              <MarketplaceSearch />

              {isRetrying && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ai-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Retrying...</p>
                </div>
              )}

              <MarketplaceGrid agents={agents} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 