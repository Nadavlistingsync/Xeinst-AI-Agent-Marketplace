"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Bot, 
  Play,
  Heart,
  Share,
  Grid,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { LiquidCard } from '../../../design-system/components/LiquidCard';
import { LiquidButton } from '../../../design-system/components/LiquidButton';
import { LiquidSearchInput } from '../../../design-system/components/LiquidSearchInput';
import { LiquidBackground } from '../../../design-system/components/LiquidBackground';
import { MarketplaceHeader } from './MarketplaceHeader';
import { MarketplaceFilters } from './MarketplaceFilters';
import { cn } from '../../../lib/utils';

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

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

const categories: FilterOption[] = [
  { id: 'automation', label: 'Automation', count: 45 },
  { id: 'communication', label: 'Communication', count: 32 },
  { id: 'data', label: 'Data Processing', count: 28 },
  { id: 'email', label: 'Email', count: 24 },
  { id: 'social', label: 'Social Media', count: 19 },
  { id: 'productivity', label: 'Productivity', count: 38 },
  { id: 'analytics', label: 'Analytics', count: 22 }
];

const tags: FilterOption[] = [
  { id: 'ai', label: 'AI', count: 156 },
  { id: 'automation', label: 'Automation', count: 89 },
  { id: 'productivity', label: 'Productivity', count: 67 },
  { id: 'integration', label: 'Integration', count: 45 },
  { id: 'workflow', label: 'Workflow', count: 38 },
];

export function LiquidMarketplace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // State
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 12;

  // Initialize from URL parameters
  useEffect(() => {
    const urlSearchQuery = searchParams.get('search');
    const urlCategories = searchParams.get('categories');
    const urlSort = searchParams.get('sort');
    const urlPage = searchParams.get('page');
    
    if (urlSearchQuery) setSearchQuery(urlSearchQuery);
    if (urlCategories) setSelectedCategories(urlCategories.split(','));
    if (urlSort) setSortBy(urlSort);
    if (urlPage) setCurrentPage(parseInt(urlPage));
  }, [searchParams]);

  // Fetch agents
  const fetchAgents = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Filter and sort agents
  const filterAndSortAgents = useCallback(() => {
    let filtered = [...agents];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(agent =>
        selectedCategories.includes(agent.category.toLowerCase())
      );
    }

    // Apply price filter
    if (selectedPriceRange !== 'all') {
      switch (selectedPriceRange) {
        case 'free':
          filtered = filtered.filter(agent => agent.price === 0);
          break;
        case '1-10':
          filtered = filtered.filter(agent => agent.price >= 1 && agent.price <= 10);
          break;
        case '10-50':
          filtered = filtered.filter(agent => agent.price > 10 && agent.price <= 50);
          break;
        case '50+':
          filtered = filtered.filter(agent => agent.price > 50);
          break;
      }
    }

    // Apply rating filter
    if (selectedRating !== 'all') {
      const minRating = parseFloat(selectedRating.replace('+', ''));
      filtered = filtered.filter(agent => agent.averageRating >= minRating);
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.downloadCount - a.downloadCount);
        break;
      case 'rating':
        filtered.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        // Relevance - keep original order or implement relevance scoring
        break;
    }

    setFilteredAgents(filtered);
  }, [agents, searchQuery, selectedCategories, selectedPriceRange, selectedRating, sortBy]);

  useEffect(() => {
    filterAndSortAgents();
  }, [filterAndSortAgents]);

  // Update URL with current filters
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const newURL = `/marketplace${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newURL, { scroll: false });
  }, [searchQuery, selectedCategories, sortBy, currentPage, router]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // Pagination
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedPriceRange('all');
    setSelectedRating('all');
    setSelectedTimeframe('all');
    setSelectedTags([]);
    setSortBy('relevance');
    setCurrentPage(1);
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className={cn(
      'grid gap-6',
      viewMode === 'grid' 
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        : 'grid-cols-1'
    )}>
      {Array.from({ length: itemsPerPage }, (_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
        >
          <LiquidCard variant="bubble" size="md" animated={false} className="h-64">
            <div className="animate-pulse space-y-4">
              <div className="w-12 h-12 bg-white/[0.10] rounded-full animate-bubble-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-white/[0.10] rounded-full animate-liquid-flow" />
                <div className="h-3 bg-white/[0.08] rounded-full w-3/4 animate-bubble-float" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-white/[0.06] rounded-full w-16" />
                <div className="h-3 bg-white/[0.06] rounded-full w-12" />
              </div>
            </div>
          </LiquidCard>
        </motion.div>
      ))}
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <motion.div
      className="text-center py-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <LiquidCard variant="flow" size="lg" color="purple" animated className="max-w-md mx-auto">
        <div className="space-y-6">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Bot className="w-16 h-16 text-purple-400 mx-auto" />
          </motion.div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">No agents found</h3>
            <p className="text-white/60">
              {searchQuery ? `No results for "${searchQuery}"` : 'No agents available yet'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {searchQuery && (
              <LiquidButton
                variant="ghost"
                size="md"
                color="purple"
                onClick={handleClearFilters}
              >
                Clear Filters
              </LiquidButton>
            )}
            <LiquidButton
              variant="bubble"
              size="md"
              color="cyan"
              animated
              href="/upload"
            >
              Upload First Agent
            </LiquidButton>
          </div>
        </div>
      </LiquidCard>
    </motion.div>
  );

  // Error state
  const ErrorState = () => (
    <motion.div
      className="text-center py-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <LiquidCard variant="glow" size="lg" color="pink" animated className="max-w-md mx-auto">
        <div className="space-y-6">
          <div className="text-pink-400 text-6xl">🫧</div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Oops! Something popped</h3>
            <p className="text-white/60">{error}</p>
          </div>
          <LiquidButton
            variant="bubble"
            size="md"
            color="pink"
            animated
            onClick={fetchAgents}
          >
            Try Again
          </LiquidButton>
        </div>
      </LiquidCard>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Liquid Background */}
      <LiquidBackground variant="particles" intensity="subtle" color="multi" />
      
      <div className="relative z-10">
        {/* Header */}
        <MarketplaceHeader 
          totalAgents={agents.length}
          totalCategories={categories.length}
          averageRating={4.8}
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Search Bar */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <LiquidSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={setSearchQuery}
              placeholder="Search liquid AI agents..."
              size="lg"
              variant="bubble"
              animated
              className="max-w-2xl mx-auto"
            />
          </motion.div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <MarketplaceFilters
                selectedCategories={selectedCategories}
                onCategoriesChange={setSelectedCategories}
                selectedPriceRange={selectedPriceRange}
                onPriceRangeChange={setSelectedPriceRange}
                selectedRating={selectedRating}
                onRatingChange={setSelectedRating}
                selectedTimeframe={selectedTimeframe}
                onTimeframeChange={setSelectedTimeframe}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                sortBy={sortBy}
                onSortChange={setSortBy}
                categories={categories}
                tags={tags}
                totalResults={filteredAgents.length}
                isLoading={loading}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Mobile Filters */}
              <div className="lg:hidden mb-6">
                <MarketplaceFilters
                  selectedCategories={selectedCategories}
                  onCategoriesChange={setSelectedCategories}
                  selectedPriceRange={selectedPriceRange}
                  onPriceRangeChange={setSelectedPriceRange}
                  selectedRating={selectedRating}
                  onRatingChange={setSelectedRating}
                  selectedTimeframe={selectedTimeframe}
                  onTimeframeChange={setSelectedTimeframe}
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  categories={categories}
                  tags={tags}
                  totalResults={filteredAgents.length}
                  isLoading={loading}
                  onClearFilters={handleClearFilters}
                />
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <LoadingSkeleton />
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ErrorState />
                  </motion.div>
                ) : paginatedAgents.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <EmptyState />
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    {/* Results Grid */}
                    <div className={cn(
                      'grid gap-6',
                      viewMode === 'grid' 
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'grid-cols-1'
                    )}>
                      {paginatedAgents.map((agent, index) => (
                        <motion.div
                          key={agent.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            delay: index * 0.05,
                            duration: 0.4,
                            type: "spring",
                            stiffness: 120,
                            damping: 15
                          }}
                        >
                          <LiquidCard
                            variant="bubble"
                            size="md"
                            color={['blue', 'purple', 'pink', 'cyan', 'green'][index % 5] as any}
                            interactive
                            animated
                            href={`/agents/${agent.id}`}
                            className="h-full group cursor-pointer"
                          >
                            <div className="space-y-4">
                              {/* Agent Header */}
                              <div className="flex items-start justify-between">
                                <motion.div
                                  className={cn(
                                    'w-12 h-12 flex items-center justify-center',
                                    'bg-gradient-to-br from-blue-400/20 to-purple-400/20',
                                    'backdrop-blur-xl border border-white/[0.15]',
                                    'group-hover:shadow-glow-blue'
                                  )}
                                  style={{
                                    borderRadius: '0.8rem 1.2rem 0.6rem 1.4rem',
                                  }}
                                  animate={{
                                    borderRadius: [
                                      '0.8rem 1.2rem 0.6rem 1.4rem',
                                      '1.2rem 0.8rem 1.4rem 0.6rem',
                                      '0.8rem 1.2rem 0.6rem 1.4rem'
                                    ],
                                    rotate: [0, 5, -5, 0],
                                  }}
                                  transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: index * 0.2,
                                  }}
                                >
                                  <Bot className="w-6 h-6 text-blue-400" />
                                </motion.div>

                                <div className="flex gap-2">
                                  <motion.button
                                    className="p-2 text-white/40 hover:text-pink-400 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Heart className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    className="p-2 text-white/40 hover:text-blue-400 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Share className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              </div>

                              {/* Content */}
                              <div>
                                <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-blue-100 transition-colors">
                                  {agent.name}
                                </h3>
                                <p className="text-white/60 text-sm leading-relaxed line-clamp-3">
                                  {agent.description}
                                </p>
                              </div>

                              {/* Category Badge */}
                              <motion.div
                                className={cn(
                                  'inline-block px-3 py-1 text-xs rounded-full',
                                  'bg-white/[0.08] border border-white/[0.15]',
                                  'text-white/70'
                                )}
                                style={{
                                  borderRadius: '1rem 0.5rem 1.2rem 0.8rem',
                                }}
                                whileHover={{
                                  borderRadius: '0.8rem 1.2rem 0.5rem 1rem',
                                  scale: 1.05,
                                }}
                              >
                                {agent.category}
                              </motion.div>

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
                                <LiquidButton
                                  variant="glow"
                                  size="sm"
                                  color="cyan"
                                  animated
                                  leftIcon={<Play className="w-4 h-4" />}
                                >
                                  Try Now
                                </LiquidButton>
                              </div>
                            </div>
                          </LiquidCard>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <motion.div
                        className="flex justify-center items-center gap-4 mt-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                      >
                        <LiquidButton
                          variant="glass"
                          size="sm"
                          color="blue"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          leftIcon={<ChevronLeft className="w-4 h-4" />}
                        >
                          Previous
                        </LiquidButton>

                        <div className="flex gap-2">
                          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <LiquidButton
                                key={pageNum}
                                variant={currentPage === pageNum ? "bubble" : "glass"}
                                size="sm"
                                color={currentPage === pageNum ? "cyan" : "blue"}
                                animated={currentPage === pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className="w-10 h-10 p-0"
                              >
                                {pageNum}
                              </LiquidButton>
                            );
                          })}
                        </div>

                        <LiquidButton
                          variant="glass"
                          size="sm"
                          color="blue"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          rightIcon={<ChevronRight className="w-4 h-4" />}
                        >
                          Next
                        </LiquidButton>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
