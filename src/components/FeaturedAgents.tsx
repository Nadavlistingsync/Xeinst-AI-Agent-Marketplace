"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
        setFeaturedAgents(data.data.filter((agent: Agent) => agent.isFeatured));
        setTrendingAgents(data.data.filter((agent: Agent) => agent.isTrending));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  if (loading) {
    return <div role="status">Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Featured Agents</h2>
        {featuredAgents.length === 0 ? (
          <p>No featured agents found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredAgents.map((agent) => (
              <div key={agent.id} className="border rounded-lg p-4">
                <img
                  src={agent.image}
                  alt={agent.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">{agent.name}</h3>
                <p className="text-gray-600 mb-4">{agent.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1">{agent.rating}</span>
                    <span className="text-gray-500 ml-1">({agent.reviews} reviews)</span>
                  </div>
                  <Link
                    href={`/agent/${agent.id}`}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Trending Agents</h2>
        {trendingAgents.length === 0 ? (
          <p>No trending agents found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingAgents.map((agent) => (
              <div key={agent.id} className="border rounded-lg p-4">
                <img
                  src={agent.image}
                  alt={agent.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">{agent.name}</h3>
                <p className="text-gray-600 mb-4">{agent.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1">{agent.rating}</span>
                    <span className="text-gray-500 ml-1">({agent.reviews} reviews)</span>
                  </div>
                  <Link
                    href={`/agent/${agent.id}`}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
} 