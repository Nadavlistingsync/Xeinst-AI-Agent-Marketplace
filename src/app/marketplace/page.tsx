'use client';

import { useState } from 'react';
import { Search, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface Agent {
  id: number;
  name: string;
  description: string;
  tag: string;
  rating: number;
}

const agents: Agent[] = [
  {
    id: 1,
    name: "Real Estate Assistant",
    description: "Automate property research and client communication",
    tag: "Real Estate",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Fitness Coach",
    description: "Personalized workout plans and nutrition tracking",
    tag: "Gym",
    rating: 4.9,
  },
  {
    id: 3,
    name: "E-commerce Optimizer",
    description: "Product recommendations and inventory management",
    tag: "Ecommerce",
    rating: 4.7,
  },
  // Add more agents here
];

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === '' || agent.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  const tags = Array.from(new Set(agents.map(agent => agent.tag)));

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
            AI Agents Marketplace
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Browse ready-made AI agents built from real client requests — automate your workflow in seconds.
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search for agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-lg bg-black/50 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
            </div>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {tags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-6 rounded-xl bg-black/50 glow-border card-hover"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-blue-900/50 text-blue-400 rounded-full text-sm">
                  {agent.tag}
                </span>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-white/80">{agent.rating}</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 glow-text">{agent.name}</h3>
              <p className="text-white/80 mb-4">{agent.description}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                View Agent
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Upload Agent Button */}
        <div className="text-center mt-12">
          <motion.a
            href="/upload"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-transparent text-blue-400 border-2 border-blue-400 py-3 px-8 rounded-lg hover:bg-blue-400/10 transition-colors duration-300"
          >
            Upload Your Agent
          </motion.a>
        </div>
      </div>
    </div>
  );
} 