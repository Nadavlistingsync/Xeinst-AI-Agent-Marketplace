"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Sparkles, 
  Bot, 
  Zap, 
  TrendingUp, 
  Users,
  ArrowRight,
  Star,
  Download,
  Play
} from 'lucide-react';
import { LiquidCard } from '../design-system/components/LiquidCard';
import { LiquidButton } from '../design-system/components/LiquidButton';
import { LiquidSearchInput } from '../design-system/components/LiquidSearchInput';
import { LiquidBackground } from '../design-system/components/LiquidBackground';
import { cn } from '../lib/utils';

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  averageRating: number;
  downloadCount: number;
}

export function LiquidHomepage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredAgents, setFeaturedAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch featured agents
  useEffect(() => {
    fetchFeaturedAgents();
  }, []);

  const fetchFeaturedAgents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/agents/featured');
      if (response.ok) {
        const data = await response.json();
        setFeaturedAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Error fetching featured agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string = searchQuery) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      router.push(`/marketplace?search=${encodeURIComponent(trimmedQuery)}`);
    } else {
      router.push('/marketplace');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const popularSearches = [
    "Email automation agent",
    "Content writer AI", 
    "Data analysis bot",
    "Social media scheduler",
    "Customer support agent",
    "Lead generation tool"
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Liquid Background */}
      <LiquidBackground variant="bubbles" intensity="medium" color="multi" />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-20">
          {/* Logo with liquid animation */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              className="flex items-center justify-center mb-6"
              animate={{
                y: [0, -5, 0],
                rotate: [0, 1, -1, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <LiquidCard 
                variant="glow" 
                size="lg" 
                color="cyan" 
                animated
                className="p-6"
              >
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Bot className="w-12 h-12 text-cyan-400" />
                </motion.div>
              </LiquidCard>
            </motion.div>
            
            <motion.h1 
              className={cn(
                'text-6xl sm:text-7xl lg:text-8xl font-bold text-center',
                'bg-gradient-to-br from-white via-blue-100 to-cyan-200',
                'bg-clip-text text-transparent',
                'tracking-tight leading-none'
              )}
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
              Xeinst
            </motion.h1>
            
            <motion.p 
              className="text-xl sm:text-2xl text-center text-white/70 mt-4 max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Discover AI agents that flow like liquid intelligence
            </motion.p>
          </motion.div>

          {/* Search Section */}
          <motion.div
            className="w-full max-w-2xl mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <LiquidSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Search for AI agents..."
              size="lg"
              variant="bubble"
              animated
              className="w-full"
            />
            
            {/* Popular searches */}
            <motion.div
              className="mt-6 flex flex-wrap justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <span className="text-sm text-white/50 mr-2">Popular:</span>
              {popularSearches.map((search, index) => (
                <motion.button
                  key={search}
                  onClick={() => handleSearch(search)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-full',
                    'bg-white/[0.06] border border-white/[0.12]',
                    'text-white/70 hover:text-white',
                    'hover:bg-white/[0.10] hover:border-white/[0.20]',
                    'transition-all duration-300',
                    'focus:outline-none focus:ring-2 focus:ring-blue-400/20'
                  )}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: 1 + (index * 0.1), 
                    duration: 0.4,
                    type: "spring",
                    stiffness: 150,
                    damping: 15
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -2,
                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    borderRadius: `${12 + Math.random() * 8}px ${8 + Math.random() * 12}px ${10 + Math.random() * 10}px ${14 + Math.random() * 6}px`,
                  }}
                >
                  {search}
                </motion.button>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <LiquidButton
                variant="bubble"
                size="lg"
                color="blue"
                animated
                onClick={() => router.push('/marketplace')}
                leftIcon={<Search className="w-5 h-5" />}
              >
                Explore Marketplace
              </LiquidButton>
              
              <LiquidButton
                variant="flow"
                size="lg"
                color="purple"
                animated
                onClick={() => router.push('/upload')}
                leftIcon={<Sparkles className="w-5 h-5" />}
              >
                Create Agent
              </LiquidButton>
            </motion.div>
          </motion.div>

          {/* Featured Agents */}
          {featuredAgents.length > 0 && (
            <motion.div
              className="w-full max-w-6xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-white/90">
                Featured Liquid Agents
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredAgents.slice(0, 6).map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: 1.7 + (index * 0.1),
                      duration: 0.6,
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
                        {/* Agent Icon */}
                        <motion.div
                          className={cn(
                            'w-12 h-12 rounded-full',
                            'bg-gradient-to-br from-blue-400/20 to-purple-400/20',
                            'flex items-center justify-center',
                            'group-hover:shadow-glow-blue'
                          )}
                          animate={{
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: index * 0.2,
                          }}
                        >
                          <Bot className="w-6 h-6 text-blue-400" />
                        </motion.div>

                        {/* Content */}
                        <div>
                          <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-blue-100 transition-colors">
                            {agent.name}
                          </h3>
                          <p className="text-white/60 text-sm leading-relaxed line-clamp-2">
                            {agent.description}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-white/50">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span>{agent.averageRating.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            <span>{agent.downloadCount.toLocaleString()}</span>
                          </div>
                          <div className="text-blue-400 font-medium">
                            {agent.price === 0 ? 'Free' : `$${agent.price}`}
                          </div>
                        </div>

                        {/* Try button */}
                        <LiquidButton
                          variant="glow"
                          size="sm"
                          color="cyan"
                          animated
                          className="w-full"
                          leftIcon={<Play className="w-4 h-4" />}
                        >
                          Try Agent
                        </LiquidButton>
                      </div>
                    </LiquidCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Stats Section */}
          <motion.div
            className="mt-16 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            {[
              { label: 'AI Agents', value: '1,200+', icon: Bot, color: 'blue' },
              { label: 'Active Users', value: '15K+', icon: Users, color: 'purple' },
              { label: 'Automations', value: '50K+', icon: Zap, color: 'pink' },
              { label: 'Success Rate', value: '99.9%', icon: TrendingUp, color: 'cyan' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: 2.2 + (index * 0.1),
                  duration: 0.6,
                  type: "spring",
                  stiffness: 150,
                  damping: 15
                }}
              >
                <LiquidCard
                  variant="float"
                  size="sm"
                  color={stat.color as any}
                  animated
                  className="text-center group"
                >
                  <motion.div
                    className="flex flex-col items-center gap-3"
                    animate={{
                      y: [0, -2, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.5,
                    }}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      'bg-gradient-to-br from-white/10 to-white/5',
                      'group-hover:shadow-glow-blue'
                    )}>
                      <stat.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {stat.value}
                      </div>
                      <div className="text-sm text-white/60">
                        {stat.label}
                      </div>
                    </div>
                  </motion.div>
                </LiquidCard>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="pb-20 px-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          <LiquidCard
            variant="flow"
            size="lg"
            color="blue"
            animated
            className="max-w-4xl mx-auto"
          >
            <div className="text-center space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Ready to dive into liquid AI?
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Join thousands of creators building the future of intelligent automation
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <LiquidButton
                  variant="bubble"
                  size="xl"
                  color="cyan"
                  animated
                  onClick={() => router.push('/signup')}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Start Creating
                </LiquidButton>
                <LiquidButton
                  variant="flow"
                  size="xl"
                  color="purple"
                  animated
                  onClick={() => router.push('/marketplace')}
                >
                  Explore Agents
                </LiquidButton>
              </div>
            </div>
          </LiquidCard>
        </motion.div>
      </div>

      {/* Floating action bubbles */}
      <div className="fixed bottom-8 right-8 z-20 space-y-4">
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <LiquidButton
            variant="glow"
            size="md"
            color="pink"
            animated
            className="rounded-full w-14 h-14 p-0"
            onClick={() => router.push('/upload')}
            aria-label="Quick upload"
          >
            <Sparkles className="w-6 h-6" />
          </LiquidButton>
        </motion.div>
      </div>
    </div>
  );
}
