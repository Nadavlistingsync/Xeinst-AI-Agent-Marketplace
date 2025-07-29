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

async function getAgents(): Promise<Agent[]> {
  // In a real app, you might have this on the server if the API is internal,
  // or you'd fetch from the absolute URL if it's external.
  // For this example, we fetch from the API route.
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/agents`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch agents');
  }
  const data = await res.json();
  return data.agents || data; // Handle both new and old response formats
}

export default function MarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const agentsData = await getAgents();
        setAgents(agentsData);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ai-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading agents...</p>
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
          {/* Search and Filters Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col lg:flex-row gap-6 mb-8"
          >
            {/* Search */}
            <div className="flex-1">
              <MarketplaceSearch />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <div className="flex items-center bg-muted/50 rounded-lg p-1">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Grid className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-ai-primary">{agents.length}</div>
              <div className="text-sm text-muted-foreground">Total Agents</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-ai-secondary">24</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-ai-accent">1.2K</div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-green-500">4.9★</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </div>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24">
                <MarketplaceFilters />
              </div>
            </motion.div>
            
            {/* Agents Grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="lg:col-span-3"
            >
              <MarketplaceGrid agents={agents} />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
} 