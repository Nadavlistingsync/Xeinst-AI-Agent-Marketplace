"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Star, TrendingUp, Award, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface Agent {
  id: string;
  name: string;
  description: string;
  tag: string;
  price?: number;
  image_url?: string;
  average_rating: number;
  total_ratings: number;
  download_count: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export default function FeaturedAgents() {
  const router = useRouter();
  const [featuredAgents, setFeaturedAgents] = useState<Agent[]>([]);
  const [trendingAgents, setTrendingAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWithRetry = useCallback(async (url: string, retries = MAX_RETRIES): Promise<any> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(url, retries - 1);
      }
      // Ensure we always throw an Error object with a message
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch data');
    }
  }, []);

  const fetchAgents = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const [featuredData, trendingData] = await Promise.all([
        fetchWithRetry('/api/agents/featured'),
        fetchWithRetry('/api/agents/trending')
      ]);

      setFeaturedAgents(featuredData.agents);
      setTrendingAgents(trendingData.agents);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load agents';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchWithRetry]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => {
            fetchAgents();
          }}
          className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div role="status" className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-20">
      {/* Featured Agents */}
      <section className="pb-12 border-b border-white/10">
        <div className="flex items-center mb-8">
          <Award className="w-7 h-7 text-yellow-400 mr-3" />
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Featured Agents</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {featuredAgents.length === 0 ? (
            <div className="col-span-full text-center text-gray-400">No featured agents found.</div>
          ) : (
            featuredAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-white/10 flex flex-col"
              >
                {agent.image_url && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={agent.image_url}
                      alt={agent.name}
                      fill
                      className="object-cover rounded-t-2xl"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={false}
                    />
                  </div>
                )}
                <div className="p-7 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {agent.tag}
                    </span>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="ml-1 text-white font-semibold">
                        {agent.average_rating.toFixed(1)}
                      </span>
                      <span className="ml-1 text-gray-400">
                        ({agent.total_ratings})
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{agent.name}</h3>
                  <p className="text-gray-300 mb-4 line-clamp-2 flex-1">{agent.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-4">
                    {agent.price ? (
                      <span className="text-xl font-bold text-blue-400">
                        ${agent.price}
                      </span>
                    ) : (
                      <span className="text-green-400 font-semibold">Free</span>
                    )}
                    <button
                      onClick={() => router.push(`/agent/${agent.id}`)}
                      className="btn-primary px-5 py-2 text-base font-semibold shadow hover:shadow-blue-500/20"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      {/* Trending Agents */}
      <section className="pt-12">
        <div className="flex items-center mb-8">
          <TrendingUp className="w-7 h-7 text-green-400 mr-3" />
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Trending Now</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {trendingAgents.length === 0 ? (
            <div className="col-span-full text-center text-gray-400">No trending agents found.</div>
          ) : (
            trendingAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-white/10 flex flex-col"
              >
                {agent.image_url && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={agent.image_url}
                      alt={agent.name}
                      fill
                      className="object-cover rounded-t-2xl"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={false}
                    />
                  </div>
                )}
                <div className="p-7 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {agent.tag}
                    </span>
                    <div className="flex items-center text-gray-400">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>{agent.download_count} downloads</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{agent.name}</h3>
                  <p className="text-gray-300 mb-4 line-clamp-2 flex-1">{agent.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-4">
                    {agent.price ? (
                      <span className="text-xl font-bold text-blue-400">
                        ${agent.price}
                      </span>
                    ) : (
                      <span className="text-green-400 font-semibold">Free</span>
                    )}
                    <button
                      onClick={() => router.push(`/agent/${agent.id}`)}
                      className="btn-primary px-5 py-2 text-base font-semibold shadow hover:shadow-blue-500/20"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
} 