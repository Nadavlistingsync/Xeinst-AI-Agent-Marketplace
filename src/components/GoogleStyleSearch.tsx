'use client';

import React, { useState, useEffect, useRef } from "react";
import { Search, Bot, Sparkles, TrendingUp, Users, ArrowRight, Star, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  averageRating: number;
  downloadCount: number;
}

export default function GoogleStyleSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Agent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [featuredAgents, setFeaturedAgents] = useState<Agent[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Popular search suggestions
  const popularSearches = [
    "Email automation agent",
    "Content writer AI",
    "Data analysis bot",
    "Social media scheduler",
    "Customer support agent",
    "Lead generation tool",
    "Code reviewer AI",
    "Meeting summarizer"
  ];

  // Auto-focus search on page load
  useEffect(() => {
    searchInputRef.current?.focus();
    fetchFeaturedAgents();
  }, []);

  // Fetch featured agents
  const fetchFeaturedAgents = async () => {
    try {
      const response = await fetch('/api/agents/featured');
      if (response.ok) {
        const data = await response.json();
        setFeaturedAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Error fetching featured agents:', error);
    }
  };

  // Search agents with debouncing
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      setShowSuggestions(true);
      
      try {
        const response = await fetch(`/api/agents/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.agents || []);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleSearch = (query: string = searchQuery) => {
    if (query.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Main Search Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 relative">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Bot className="h-16 w-16 text-blue-500 mr-4" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
              Xeinst
            </h1>
          </div>
          <p className="text-xl text-gray-400 text-center">
            Find the perfect AI agent for any task
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full max-w-2xl"
        >
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search..."
              className="w-full pl-16 pr-16 py-5 text-lg font-medium text-white placeholder-white/50 bg-white/8 backdrop-blur-xl border border-white/20 rounded-full focus:outline-none focus:border-white/40 focus:bg-white/12 focus:shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all duration-300 hover:bg-white/10 hover:border-white/30"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(255, 255, 255, 0.05)'
              }}
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          {/* Search Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && (searchResults.length > 0 || popularSearches.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full mt-3 w-full bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 z-50"
                style={{
                  boxShadow: '0 16px 64px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Agents</h3>
                    {searchResults.slice(0, 5).map((agent) => (
                      <Link
                        key={agent.id}
                        href={`/agents/${agent.id}`}
                        className="flex items-center p-4 hover:bg-white/8 rounded-xl transition-all duration-300 group border border-transparent hover:border-white/20 backdrop-blur-sm"
                        style={{
                          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                        }}
                      >
                        <Bot className="h-5 w-5 text-white/80 mr-4 flex-shrink-0 group-hover:text-white transition-colors" />
                        <div className="flex-1">
                          <div className="font-semibold text-white group-hover:text-white/90 transition-colors">
                            {agent.name}
                          </div>
                          <div className="text-sm text-white/60 truncate">
                            {agent.description}
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-white/50">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {agent.averageRating.toFixed(1)}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Popular Searches */}
                {searchQuery.length < 2 && (
                  <div>
                    <h3 className="text-sm font-semibold text-white/70 mb-3">Popular Searches</h3>
                    {popularSearches.slice(0, 6).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="flex items-center p-3 hover:bg-white/8 rounded-xl transition-all duration-300 w-full text-left group border border-transparent hover:border-white/20"
                        style={{
                          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                        }}
                      >
                        <TrendingUp className="h-4 w-4 text-white/60 mr-3 group-hover:text-white/80 transition-colors" />
                        <span className="text-white/80 group-hover:text-white transition-colors font-medium">{search}</span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Search Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => handleSearch()}
            className="px-8 py-4 bg-white/8 hover:bg-white/12 border border-white/20 hover:border-white/40 rounded-full transition-all duration-300 backdrop-blur-xl font-medium text-white hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:text-white"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            Search Agents
          </button>
          <Link
            href="/marketplace"
            className="px-8 py-4 bg-white/12 hover:bg-white/16 border border-white/30 hover:border-white/50 rounded-full transition-all duration-300 backdrop-blur-xl font-medium text-white hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
            }}
          >
            Browse All Agents
          </Link>
        </motion.div>
      </div>

      {/* Featured Agents Section */}
      {featuredAgents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="px-4 pb-16"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-300">
              Featured AI Agents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAgents.slice(0, 6).map((agent) => (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  className="group"
                >
                  <div 
                    className="bg-white/6 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:border-white/40 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                    style={{
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-white/10 rounded-xl mr-4 backdrop-blur-sm border border-white/20">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-white/90 transition-colors">
                          {agent.name}
                        </h3>
                        <div className="flex items-center text-sm text-white/60">
                          <Star className="h-3 w-3 mr-1 fill-current text-white/70" />
                          {agent.averageRating.toFixed(1)} • {agent.downloadCount} uses
                        </div>
                      </div>
                    </div>
                    <p className="text-white/70 text-sm mb-4 line-clamp-2">
                      {agent.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold bg-white/10 px-3 py-1 rounded-full border border-white/20">
                        {agent.price} credits
                      </span>
                      <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="border-t border-white/10 py-8 px-4"
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">1,000+</div>
            <div className="text-sm text-gray-400">AI Agents</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">50K+</div>
            <div className="text-sm text-gray-400">Executions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">500+</div>
            <div className="text-sm text-gray-400">Creators</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">99.9%</div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
