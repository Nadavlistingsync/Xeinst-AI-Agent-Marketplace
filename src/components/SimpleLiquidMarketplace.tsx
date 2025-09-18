"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  Star, 
  Download, 
  Bot, 
  Play,
  Grid,
  List
} from 'lucide-react';
import { cn } from '../lib/utils';
import { announceToScreenReader, keyboardNavigation } from '../lib/accessibility';
import { marketplaceEvents, trackPageView } from '../lib/analytics';

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  downloadCount: number;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  creator: {
    name: string;
  };
}

export function SimpleLiquidMarketplace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);

  // Initialize from URL parameters
  useEffect(() => {
    const urlSearchQuery = searchParams.get('search');
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
    }
    
    // Track page view
    trackPageView('marketplace', {
      hasSearch: !!urlSearchQuery,
      searchQuery: urlSearchQuery,
    });
  }, [searchParams]);

  // Fetch agents
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/agents');
      
      if (!response.ok) {
        if (response.status === 503) {
          setError('Database not configured. Please set up your database to view agents.');
          return;
        }
        throw new Error('Failed to fetch agents');
      }
      
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError('Failed to load agents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    router.replace(`/marketplace${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
    
    // Track search and announce results to screen readers
    setTimeout(() => {
      const resultCount = filteredAgents.length;
      
      // Track search analytics
      if (query) {
        marketplaceEvents.search(query, resultCount);
      }
      
      announceToScreenReader(
        query 
          ? `Search completed. ${resultCount} agents found for "${query}"`
          : `Showing all ${resultCount} agents`
      );
    }, 500);
  };

  const filteredAgents = agents.filter(agent =>
    !searchQuery || 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Skip to main content link */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Skip to main content
      </a>

      {/* Floating Bubbles Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 12 }, (_, i) => (
          <motion.div
            key={i}
            className={cn(
              'absolute rounded-full blur-sm',
              i % 4 === 0 ? 'bg-blue-500/10' : 
              i % 4 === 1 ? 'bg-purple-400/10' : 
              i % 4 === 2 ? 'bg-pink-500/8' : 'bg-cyan-400/12'
            )}
            style={{
              width: `${Math.random() * 80 + 40}px`,
              height: `${Math.random() * 80 + 40}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.header
          className="py-16 px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto text-center">
            <motion.h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-br from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent tracking-tight leading-tight mb-6"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: '200% 200%',
              }}
            >
              AI Agent Marketplace
            </motion.h1>
            <motion.p 
              className="text-xl text-white/70 max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Discover AI agents that flow like liquid intelligence
            </motion.p>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {[
                { label: 'AI Agents', value: agents.length.toLocaleString() },
                { label: 'Categories', value: '8' },
                { label: 'Avg Rating', value: '4.8' },
                { label: 'Active Users', value: '12.5K' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="p-4 bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-[1rem_1.5rem_1.2rem_1.8rem] text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + (index * 0.1), duration: 0.6 }}
                  whileHover={{ y: -2, scale: 1.05 }}
                >
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Search Bar */}
          <motion.div
            className="mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <div className="relative">
              <label htmlFor="agent-search" className="sr-only">
                Search AI agents by name, description, or category
              </label>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" aria-hidden="true" />
              <input
                id="agent-search"
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    handleSearch('');
                  }
                }}
                placeholder="Search liquid AI agents..."
                aria-label="Search AI agents by name, description, or category"
                aria-describedby="search-help"
                role="searchbox"
                className={cn(
                  'w-full pl-12 pr-4 py-4 text-white placeholder:text-white/40',
                  'bg-white/[0.08] backdrop-blur-xl border-2 border-white/[0.15]',
                  'rounded-[1.5rem_2rem_1.8rem_2.5rem]',
                  'focus:outline-none focus:ring-2 focus:ring-blue-400/20',
                  'focus:border-blue-400/30 focus:bg-white/[0.12]',
                  'hover:bg-white/[0.10] hover:border-white/[0.20]',
                  'transition-all duration-300'
                )}
              />
              <div id="search-help" className="sr-only">
                Use the search box to find agents. Press Escape to clear the search.
              </div>
            </div>
          </motion.div>

          {/* View Controls */}
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            <div className="text-white/60">
              {loading ? 'Loading...' : `${filteredAgents.length} agents found`}
            </div>
            
            <div className="flex items-center gap-4">
              <div 
                className="flex items-center gap-1 bg-white/[0.06] rounded-xl p-1"
                role="tablist"
                aria-label="View mode selection"
              >
                <button
                  onClick={() => {
                    setViewMode('grid');
                    marketplaceEvents.viewModeChanged('grid');
                  }}
                  className={cn(
                    'p-2 rounded-lg transition-all duration-200',
                    viewMode === 'grid'
                      ? 'bg-white/[0.12] text-white shadow-sm'
                      : 'text-white/60 hover:text-white/80 hover:bg-white/[0.04]'
                  )}
                  role="tab"
                  aria-selected={viewMode === 'grid'}
                  aria-label="Grid view"
                  aria-describedby="grid-view-desc"
                >
                  <Grid className="w-4 h-4" aria-hidden="true" />
                  <span className="sr-only">Grid view</span>
                </button>
                <button
                  onClick={() => {
                    setViewMode('list');
                    marketplaceEvents.viewModeChanged('list');
                  }}
                  className={cn(
                    'p-2 rounded-lg transition-all duration-200',
                    viewMode === 'list'
                      ? 'bg-white/[0.12] text-white shadow-sm'
                      : 'text-white/60 hover:text-white/80 hover:bg-white/[0.04]'
                  )}
                  role="tab"
                  aria-selected={viewMode === 'list'}
                  aria-label="List view"
                  aria-describedby="list-view-desc"
                >
                  <List className="w-4 h-4" aria-hidden="true" />
                  <span className="sr-only">List view</span>
                </button>
              </div>
              
              {/* Hidden descriptions for screen readers */}
              <div id="grid-view-desc" className="sr-only">Display agents in a grid layout</div>
              <div id="list-view-desc" className="sr-only">Display agents in a list layout</div>
            </div>
          </motion.div>

          {/* Content */}
          {loading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }, (_, i) => (
                <motion.div
                  key={i}
                  className="p-6 bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-[1.5rem_2rem_1.8rem_2.5rem] animate-bubble-pulse"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <div className="animate-pulse space-y-4">
                    <div className="w-12 h-12 bg-white/[0.10] rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 bg-white/[0.10] rounded-full" />
                      <div className="h-3 bg-white/[0.08] rounded-full w-3/4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : error ? (
            // Error state
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="max-w-md mx-auto p-8 bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-[2rem_3rem_2.5rem_3.5rem]">
                <div className="space-y-6">
                  <div className="text-pink-400 text-6xl">🫧</div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Oops! Something popped</h3>
                    <p className="text-white/60">{error}</p>
                  </div>
                  <button
                    onClick={fetchAgents}
                    className="px-6 py-3 bg-pink-500/20 border border-pink-400/30 text-pink-300 rounded-[1rem_1.5rem_1.2rem_1.8rem] hover:bg-pink-500/30 transition-all duration-300"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </motion.div>
          ) : filteredAgents.length === 0 ? (
            // Empty state
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="max-w-md mx-auto p-8 bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-[2rem_3rem_2.5rem_3.5rem]">
                <div className="space-y-6">
                  <Bot className="w-16 h-16 text-purple-400 mx-auto" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">No agents found</h3>
                    <p className="text-white/60">
                      {searchQuery ? `No results for "${searchQuery}"` : 'No agents available yet'}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {searchQuery && (
                      <button
                        onClick={() => handleSearch('')}
                        className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all duration-300"
                      >
                        Clear Search
                      </button>
                    )}
                    <a
                      href="/upload"
                      className="px-6 py-3 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 rounded-[1rem_1.5rem_1.2rem_1.8rem] hover:bg-cyan-500/30 transition-all duration-300"
                    >
                      Upload First Agent
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            // Agent grid
            <motion.div
              className={cn(
                'grid gap-6',
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              role="grid"
              aria-label={`AI agents displayed in ${viewMode} view`}
              onKeyDown={(e) => keyboardNavigation.handleGridNavigation(e, e.currentTarget)}
            >
              {filteredAgents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 1.4 + (index * 0.05),
                    duration: 0.4 
                  }}
                >
                  <motion.a
                    href={`/agents/${agent.id}`}
                    onClick={() => {
                      marketplaceEvents.agentClicked(agent.id, agent.name, index);
                    }}
                    className={cn(
                      'block p-6 bg-white/[0.08] backdrop-blur-xl',
                      'border border-white/[0.12] text-white',
                      'rounded-[1.5rem_2rem_1.8rem_2.5rem]',
                      'hover:bg-white/[0.12] hover:border-white/[0.18]',
                      'hover:shadow-bubble-lg transition-all duration-300',
                      'group cursor-pointer',
                      'focus:outline-none focus:ring-2 focus:ring-blue-400/30',
                      'focus:border-blue-400/40'
                    )}
                    role="gridcell"
                    aria-label={`${agent.name} - ${agent.description.slice(0, 100)}... Rating: ${agent.averageRating} stars, Price: ${agent.price === 0 ? 'Free' : `$${agent.price}`}`}
                    tabIndex={0}
                    whileHover={{ 
                      scale: 1.02, 
                      y: -5,
                      borderRadius: '2rem_1.5rem_2.5rem_1.8rem',
                    }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      borderRadius: [
                        '1.5rem 2rem 1.8rem 2.5rem',
                        '2rem 1.5rem 2.5rem 1.8rem',
                        '1.5rem 2rem 1.8rem 2.5rem'
                      ],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2,
                    }}
                  >
                    <div className="space-y-4">
                      {/* Agent Icon */}
                      <motion.div
                        className={cn(
                          'w-12 h-12 flex items-center justify-center',
                          'bg-gradient-to-br from-blue-400/20 to-purple-400/20',
                          'backdrop-blur-xl border border-white/[0.15]',
                          'rounded-[0.8rem_1.2rem_0.6rem_1.4rem]',
                          'group-hover:shadow-glow-blue'
                        )}
                        animate={{
                          borderRadius: [
                            '0.8rem 1.2rem 0.6rem 1.4rem',
                            '1.2rem 0.8rem 1.4rem 0.6rem',
                            '0.8rem 1.2rem 0.6rem 1.4rem'
                          ],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.1,
                        }}
                      >
                        <Bot className="w-6 h-6 text-blue-400" />
                      </motion.div>

                      {/* Content */}
                      <div>
                        <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-blue-100 transition-colors">
                          {agent.name}
                        </h3>
                        <p className="text-white/60 text-sm leading-relaxed line-clamp-3">
                          {agent.description}
                        </p>
                      </div>

                      {/* Category */}
                      <div className="inline-block px-3 py-1 text-xs bg-white/[0.08] border border-white/[0.15] text-white/70 rounded-[1rem_0.5rem_1.2rem_0.8rem]">
                        {agent.category}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span>{agent.averageRating.toFixed(1)}</span>
                          <span className="text-white/30">({agent.totalReviews})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          <span>{agent.downloadCount.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Price and CTA */}
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-cyan-400">
                          {agent.price === 0 ? 'Free' : `$${agent.price}`}
                        </div>
                        <motion.button
                          className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 rounded-[0.8rem_1.2rem_0.6rem_1.4rem] hover:bg-cyan-500/30 transition-all duration-300 flex items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.preventDefault();
                            marketplaceEvents.agentClicked(agent.id, agent.name, index);
                            router.push(`/use-agent/${agent.id}`);
                          }}
                        >
                          <Play className="w-4 h-4" />
                          Try Now
                        </motion.button>
                      </div>
                    </div>
                  </motion.a>
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}