"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  X, 
  ChevronDown, 
  Star,
  DollarSign,
  Calendar,
  Tag,
  Grid,
  List,
  SlidersHorizontal
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../../design-system/components/Button';
import { GlassCard } from '../../../design-system/components/GlassCard';
import { tokens } from '../../../design-system/tokens';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface MarketplaceFiltersProps {
  // Filter states
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  
  selectedPriceRange: string;
  onPriceRangeChange: (range: string) => void;
  
  selectedRating: string;
  onRatingChange: (rating: string) => void;
  
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  
  // View mode
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  
  // Sort
  sortBy: string;
  onSortChange: (sort: string) => void;
  
  // Data
  categories: FilterOption[];
  tags: FilterOption[];
  
  // State
  totalResults: number;
  isLoading?: boolean;
  
  // Actions
  onClearFilters: () => void;
}

const priceRanges = [
  { id: 'all', label: 'All Prices' },
  { id: 'free', label: 'Free' },
  { id: '1-10', label: '$1 - $10' },
  { id: '10-50', label: '$10 - $50' },
  { id: '50+', label: '$50+' },
];

const ratingOptions = [
  { id: 'all', label: 'All Ratings' },
  { id: '4+', label: '4+ Stars' },
  { id: '4.5+', label: '4.5+ Stars' },
  { id: '5', label: '5 Stars' },
];

const timeframes = [
  { id: 'all', label: 'All Time' },
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
];

const sortOptions = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'rating', label: 'Top Rated' },
  { id: 'newest', label: 'Newest' },
  { id: 'price_low', label: 'Price: Low to High' },
  { id: 'price_high', label: 'Price: High to Low' },
];

export function MarketplaceFilters({
  selectedCategories,
  onCategoriesChange,
  selectedPriceRange,
  onPriceRangeChange,
  selectedRating,
  onRatingChange,
  selectedTimeframe,
  onTimeframeChange,
  selectedTags,
  onTagsChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  categories,
  tags,
  totalResults,
  isLoading = false,
  onClearFilters,
}: MarketplaceFiltersProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['categories', 'price'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const hasActiveFilters = 
    selectedCategories.length > 0 ||
    selectedPriceRange !== 'all' ||
    selectedRating !== 'all' ||
    selectedTimeframe !== 'all' ||
    selectedTags.length > 0;

  const FilterSection = ({ 
    id, 
    title, 
    icon: Icon, 
    children 
  }: { 
    id: string; 
    title: string; 
    icon: React.ComponentType<any>; 
    children: React.ReactNode; 
  }) => {
    const isExpanded = expandedSections.has(id);
    
    return (
      <div className="border-b border-white/[0.08] last:border-b-0">
        <button
          onClick={() => toggleSection(id)}
          className={cn(
            'w-full flex items-center justify-between p-4',
            'text-left hover:bg-white/[0.04]',
            'transition-colors duration-200',
            'focus:outline-none focus:bg-white/[0.06]'
          )}
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4 text-white/60" />
            <span className="font-medium text-white">{title}</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={tokens.motion.spring.gentle}
          >
            <ChevronDown className="w-4 h-4 text-white/40" />
          </motion.div>
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={tokens.motion.spring.gentle}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const FilterContent = () => (
    <div className="space-y-0">
      {/* Categories */}
      <FilterSection id="categories" title="Categories" icon={Grid}>
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category.id}
              className={cn(
                'flex items-center justify-between p-2 rounded-lg',
                'hover:bg-white/[0.04] cursor-pointer',
                'transition-colors duration-200'
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onCategoriesChange([...selectedCategories, category.id]);
                    } else {
                      onCategoriesChange(selectedCategories.filter(id => id !== category.id));
                    }
                  }}
                  className={cn(
                    'w-4 h-4 rounded border border-white/[0.24]',
                    'bg-transparent checked:bg-primary-500',
                    'checked:border-primary-500',
                    'focus:ring-2 focus:ring-primary-400/20',
                    'transition-colors duration-200'
                  )}
                />
                <span className="text-sm text-white/80">{category.label}</span>
              </div>
              {category.count && (
                <span className="text-xs text-white/40 bg-white/[0.06] px-2 py-1 rounded-full">
                  {category.count}
                </span>
              )}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection id="price" title="Price Range" icon={DollarSign}>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label
              key={range.id}
              className={cn(
                'flex items-center gap-3 p-2 rounded-lg',
                'hover:bg-white/[0.04] cursor-pointer',
                'transition-colors duration-200'
              )}
            >
              <input
                type="radio"
                name="priceRange"
                value={range.id}
                checked={selectedPriceRange === range.id}
                onChange={(e) => onPriceRangeChange(e.target.value)}
                className={cn(
                  'w-4 h-4 border border-white/[0.24]',
                  'bg-transparent checked:bg-primary-500',
                  'checked:border-primary-500',
                  'focus:ring-2 focus:ring-primary-400/20',
                  'transition-colors duration-200'
                )}
              />
              <span className="text-sm text-white/80">{range.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection id="rating" title="Rating" icon={Star}>
        <div className="space-y-2">
          {ratingOptions.map((rating) => (
            <label
              key={rating.id}
              className={cn(
                'flex items-center gap-3 p-2 rounded-lg',
                'hover:bg-white/[0.04] cursor-pointer',
                'transition-colors duration-200'
              )}
            >
              <input
                type="radio"
                name="rating"
                value={rating.id}
                checked={selectedRating === rating.id}
                onChange={(e) => onRatingChange(e.target.value)}
                className={cn(
                  'w-4 h-4 border border-white/[0.24]',
                  'bg-transparent checked:bg-primary-500',
                  'checked:border-primary-500',
                  'focus:ring-2 focus:ring-primary-400/20',
                  'transition-colors duration-200'
                )}
              />
              <span className="text-sm text-white/80">{rating.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Timeframe */}
      <FilterSection id="timeframe" title="Updated" icon={Calendar}>
        <div className="space-y-2">
          {timeframes.map((timeframe) => (
            <label
              key={timeframe.id}
              className={cn(
                'flex items-center gap-3 p-2 rounded-lg',
                'hover:bg-white/[0.04] cursor-pointer',
                'transition-colors duration-200'
              )}
            >
              <input
                type="radio"
                name="timeframe"
                value={timeframe.id}
                checked={selectedTimeframe === timeframe.id}
                onChange={(e) => onTimeframeChange(e.target.value)}
                className={cn(
                  'w-4 h-4 border border-white/[0.24]',
                  'bg-transparent checked:bg-primary-500',
                  'checked:border-primary-500',
                  'focus:ring-2 focus:ring-primary-400/20',
                  'transition-colors duration-200'
                )}
              />
              <span className="text-sm text-white/80">{timeframe.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Tags */}
      {tags.length > 0 && (
        <FilterSection id="tags" title="Tags" icon={Tag}>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 20).map((tag) => (
              <button
                key={tag.id}
                onClick={() => {
                  if (selectedTags.includes(tag.id)) {
                    onTagsChange(selectedTags.filter(id => id !== tag.id));
                  } else {
                    onTagsChange([...selectedTags, tag.id]);
                  }
                }}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-full',
                  'border transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary-400/20',
                  selectedTags.includes(tag.id)
                    ? 'bg-primary-500/20 border-primary-400/40 text-primary-300'
                    : 'bg-white/[0.04] border-white/[0.12] text-white/70 hover:bg-white/[0.08] hover:border-white/[0.18]'
                )}
              >
                {tag.label}
                {tag.count && (
                  <span className="ml-1 opacity-60">({tag.count})</span>
                )}
              </button>
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters Panel */}
      <div className="hidden lg:block">
        <GlassCard variant="subtle" size="sm" className="sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-xs"
              >
                Clear All
              </Button>
            )}
          </div>
          <FilterContent />
        </GlassCard>
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        {/* Filter Toggle Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="glass"
              size="sm"
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              onClick={() => setShowMobileFilters(true)}
              className="relative"
            >
              Filters
              {hasActiveFilters && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary-400 rounded-full" />
              )}
            </Button>
            
            <span className="text-sm text-white/60">
              {isLoading ? 'Loading...' : `${totalResults.toLocaleString()} results`}
            </span>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white/[0.06] rounded-xl p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                viewMode === 'grid'
                  ? 'bg-white/[0.12] text-white shadow-sm'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/[0.04]'
              )}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                viewMode === 'list'
                  ? 'bg-white/[0.12] text-white shadow-sm'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/[0.04]'
              )}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        <AnimatePresence>
          {showMobileFilters && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileFilters(false)}
              />
              
              {/* Drawer */}
              <motion.div
                className="fixed right-0 top-0 h-full w-80 max-w-[90vw] z-50"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={tokens.motion.spring.gentle}
              >
                <GlassCard variant="elevated" size="md" className="h-full rounded-none rounded-l-3xl">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Filters
                    </h3>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className={cn(
                        'p-2 rounded-xl text-white/60',
                        'hover:text-white hover:bg-white/[0.08]',
                        'transition-colors duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-primary-400/20'
                      )}
                      aria-label="Close filters"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Filter Content */}
                  <div className="flex-1 overflow-y-auto">
                    <FilterContent />
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-6 border-t border-white/[0.08] flex gap-3">
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="flex-1"
                      >
                        Clear All
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowMobileFilters(false)}
                      className="flex-1"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Sort Dropdown - Desktop */}
      <div className="hidden lg:flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/60">
            {isLoading ? 'Loading...' : `${totalResults.toLocaleString()} results`}
          </span>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              leftIcon={<X className="w-3 h-3" />}
              className="text-xs"
            >
              Clear Filters
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className={cn(
                'appearance-none bg-white/[0.06] backdrop-blur-xl',
                'border border-white/[0.12] rounded-xl',
                'px-4 py-2 pr-10 text-sm text-white',
                'focus:outline-none focus:ring-2 focus:ring-primary-400/20',
                'focus:border-primary-400/30',
                'hover:bg-white/[0.08] hover:border-white/[0.16]',
                'transition-all duration-200'
              )}
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id} className="bg-gray-900">
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white/[0.06] rounded-xl p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                viewMode === 'grid'
                  ? 'bg-white/[0.12] text-white shadow-sm'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/[0.04]'
              )}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                viewMode === 'list'
                  ? 'bg-white/[0.12] text-white shadow-sm'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/[0.04]'
              )}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
