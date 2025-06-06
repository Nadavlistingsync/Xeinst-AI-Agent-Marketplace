"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Agent } from '@/types/agent';

export function FeaturedAgents() {
  const [featuredAgents, setFeaturedAgents] = useState<Agent[]>([]);
  const [trendingAgents, setTrendingAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        if (!response.ok) {
          throw new Error('Failed to load featured agents');
        }
        const data = await response.json();
        if (data.agents) {
          // Filter agents based on isFeatured and isTrending flags
          const featured = data.agents.filter((agent: Agent) => agent.isFeatured);
          const trending = data.agents.filter((agent: Agent) => agent.isTrending);
          setFeaturedAgents(featured);
          setTrendingAgents(trending);
        } else if (data.error) {
          throw new Error(data.error);
        } else {
          // Handle empty response by setting empty arrays
          setFeaturedAgents([]);
          setTrendingAgents([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  if (loading) {
    return (
      <div role="status" aria-label="Loading agents" className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00AFFF]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  const renderAgentCard = (agent: Agent) => (
    <div key={agent.id} className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
      <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
        <Image
          src={agent.metadata?.image || '/agent-placeholder.png'}
          alt={agent.name}
          fill={true}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <h3 className="text-xl font-semibold mb-2">{agent.name}</h3>
      <p className="text-gray-300 mb-4 line-clamp-2">{agent.description}</p>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-yellow-500">★</span>
          <span className="ml-1 text-gray-300">
            {agent.metadata?.rating || 0}
          </span>
          <span className="text-gray-400 ml-1">
            ({agent.metadata?.reviews || 0} reviews)
          </span>
        </div>
        <Link
          href={`/agent/${agent.id}`}
          className="bg-[#00AFFF] text-white px-4 py-2 rounded-lg hover:bg-[#0090cc] transition-all duration-300"
        >
          View Details
        </Link>
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl font-bold mb-8">Featured Agents</h2>
        {featuredAgents.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            <p>No featured agents found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAgents.map(renderAgentCard)}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-8">Trending Agents</h2>
        {trendingAgents.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            <p>No trending agents found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingAgents.map(renderAgentCard)}
          </div>
        )}
      </section>
    </div>
  );
} 