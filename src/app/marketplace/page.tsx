"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Grid, 
  List, 
  Star, 
  Bot,
  TrendingUp,
  Plus
} from "lucide-react";
import { GlowButton } from "../../components/ui/GlowButton";
import { GlassCard } from "../../components/ui/GlassCard";

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rating?: number;
  totalRuns?: number;
  tags?: string[];
  status: string;
  createdAt: string;
}

async function getAgents(): Promise<Agent[]> {
  try {
    // First try the main API
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/agents`, { 
      cache: 'no-store' 
    });
    if (!res.ok) {
      throw new Error('Main API failed');
    }
    const data = await res.json();
    return data.agents || [];
  } catch (error) {
    // Fallback to simple API
    try {
      const simpleRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/api/agents/simple`, { 
        cache: 'no-store' 
      });
      if (simpleRes.ok) {
        const simpleData = await simpleRes.json();
        return simpleData.agents || [];
      }
    } catch (simpleError) {
      console.warn('Simple API also failed:', simpleError);
    }
    
    // Return mock data if all APIs fail
    return [
      {
        id: "1",
        name: "Content Generator Pro",
        description: "Generate high-quality blog posts, articles, and marketing copy with AI-powered content creation.",
        category: "content",
        price: 50,
        rating: 4.8,
        totalRuns: 1250,
        tags: ["content", "writing", "marketing"],
        status: "active",
        createdAt: new Date().toISOString()
      },
      {
        id: "2", 
        name: "Data Analyzer",
        description: "Automatically analyze datasets and generate insights, charts, and reports.",
        category: "data",
        price: 75,
        rating: 4.6,
        totalRuns: 890,
        tags: ["data", "analytics", "reports"],
        status: "active",
        createdAt: new Date().toISOString()
      },
      {
        id: "3",
        name: "Social Media Manager",
        description: "Schedule posts, engage with followers, and analyze social media performance across platforms.",
        category: "marketing",
        price: 60,
        rating: 4.7,
        totalRuns: 2100,
        tags: ["social", "marketing", "automation"],
        status: "active",
        createdAt: new Date().toISOString()
      },
      {
        id: "4",
        name: "Code Reviewer",
        description: "Automatically review code for bugs, security issues, and best practices.",
        category: "development",
        price: 40,
        rating: 4.9,
        totalRuns: 1800,
        tags: ["development", "code", "review"],
        status: "active",
        createdAt: new Date().toISOString()
      },
      {
        id: "5",
        name: "Research Assistant",
        description: "Gather and summarize information from multiple sources for research projects.",
        category: "research",
        price: 35,
        rating: 4.5,
        totalRuns: 950,
        tags: ["research", "information", "summarization"],
        status: "active",
        createdAt: new Date().toISOString()
      },
      {
        id: "6",
        name: "Email Automation",
        description: "Create personalized email campaigns and automate follow-ups based on user behavior.",
        category: "automation",
        price: 55,
        rating: 4.6,
        totalRuns: 1650,
        tags: ["email", "automation", "marketing"],
        status: "active",
        createdAt: new Date().toISOString()
      }
    ];
  }
}

export default function MarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  
  const [error, setError] = useState<string | null>(null);

  const categories = [
    "all",
    "automation",
    "content",
    "data",
    "development",
    "marketing",
    "productivity",
    "research",
    "social",
    "other"
  ];

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const agentsData = await getAgents();
      setAgents(agentsData);
      setFilteredAgents(agentsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Filter and sort agents
  useEffect(() => {
    let filtered = agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || agent.category === selectedCategory;
      const matchesPrice = agent.price >= priceRange[0] && agent.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice && agent.status === "active";
    });

    // Sort agents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "popular":
        default:
          return (b.totalRuns || 0) - (a.totalRuns || 0);
      }
    });

    setFilteredAgents(filtered);
  }, [agents, searchTerm, selectedCategory, sortBy, priceRange]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="max-w-md text-center">
          <div className="space-y-4">
            <Bot className="h-12 w-12 text-cyan-400 mx-auto" />
            <h3 className="text-lg font-semibold text-white">Error Loading Agents</h3>
            <p className="text-white/70">{error}</p>
            <GlowButton onClick={fetchAgents} variant="outline">
              Try Again
            </GlowButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Header */}
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-glow">
                AI Agent Marketplace
              </h1>
              <p className="text-xl text-white/70 max-w-2xl">
                Discover and use powerful AI agents created by developers worldwide
              </p>
            </div>
            <GlowButton variant="neon" href="/upload">
              <Plus className="h-4 w-4 mr-2" />
              Upload Agent
            </GlowButton>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <GlassCard className="sticky top-24">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Filters</h3>
                  
                  {/* Search */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                      <input
                        type="text"
                        placeholder="Search agents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-white/20 bg-white/5 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-200"
                    >
                      {categories.map(category => (
                        <option key={category} value={category} className="bg-black text-white">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Price Range</label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-white/70">
                        <span>0 credits</span>
                        <span>{priceRange[1]} credits</span>
                      </div>
                    </div>
                  </div>

                  {/* Sort */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-white/20 bg-white/5 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-all duration-200"
                    >
                      <option value="popular" className="bg-black text-white">Most Popular</option>
                      <option value="rating" className="bg-black text-white">Highest Rated</option>
                      <option value="price-low" className="bg-black text-white">Price: Low to High</option>
                      <option value="price-high" className="bg-black text-white">Price: High to Low</option>
                      <option value="newest" className="bg-black text-white">Newest</option>
                    </select>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Agents Grid */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold text-white">
                    {filteredAgents.length} Agents Found
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "grid" 
                          ? "bg-cyan-400 text-black" 
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "list" 
                          ? "bg-cyan-400 text-black" 
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <GlassCard key={i} className="animate-pulse">
                      <div className="space-y-4">
                        <div className="h-4 bg-white/20 rounded w-3/4"></div>
                        <div className="h-3 bg-white/20 rounded w-full"></div>
                        <div className="h-3 bg-white/20 rounded w-2/3"></div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-4"
                }>
                  {filteredAgents.map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <GlassCard className={viewMode === "list" ? "flex items-center space-x-4" : ""}>
                        {viewMode === "grid" ? (
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-10 h-10 rounded-full bg-cyan-400/20 flex items-center justify-center">
                                  <Bot className="h-5 w-5 text-cyan-400" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-white">{agent.name}</h3>
                                  <p className="text-sm text-white/70">{agent.category}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-cyan-400">{agent.price}</div>
                                <div className="text-xs text-white/50">credits</div>
                              </div>
                            </div>
                            
                            <p className="text-sm text-white/70 line-clamp-2">
                              {agent.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-white/60">
                                {agent.rating && (
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span>{agent.rating.toFixed(1)}</span>
                                  </div>
                                )}
                                {agent.totalRuns && (
                                  <div className="flex items-center space-x-1">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>{agent.totalRuns}</span>
                                  </div>
                                )}
                              </div>
                              <GlowButton size="sm">
                                Use Agent
                              </GlowButton>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0">
                              <Bot className="h-6 w-6 text-cyan-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-white truncate">{agent.name}</h3>
                                <div className="text-lg font-bold text-cyan-400">{agent.price} credits</div>
                              </div>
                              <p className="text-sm text-white/70 mt-1 line-clamp-1">
                                {agent.description}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-white/60">
                                <span className="capitalize">{agent.category}</span>
                                {agent.rating && (
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span>{agent.rating.toFixed(1)}</span>
                                  </div>
                                )}
                                {agent.totalRuns && (
                                  <div className="flex items-center space-x-1">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>{agent.totalRuns} runs</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <GlowButton size="sm">
                              Use Agent
                            </GlowButton>
                          </>
                        )}
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              )}

              {!loading && filteredAgents.length === 0 && (
                <GlassCard className="text-center py-12">
                  <div className="space-y-4">
                    <Bot className="h-12 w-12 text-white/50 mx-auto" />
                    <h3 className="text-lg font-semibold text-white">No agents found</h3>
                    <p className="text-white/70">
                      Try adjusting your filters or search terms to find more agents.
                    </p>
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}