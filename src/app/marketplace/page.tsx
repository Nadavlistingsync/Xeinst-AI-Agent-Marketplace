"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Star } from 'lucide-react';
import Image from 'next/image';
import SearchFilters, { SearchFilters as SearchFiltersType } from '@/components/SearchFilters';
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
  created_at: string;
}

export default function MarketplacePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFiltersType>({
    query: '',
    category: 'All',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    sortBy: 'newest',
  });

  useEffect(() => {
    fetchAgents();
  }, [filters]);

  const fetchAgents = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.query) queryParams.append('query', filters.query);
      if (filters.category !== 'All') queryParams.append('category', filters.category);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
      if (filters.minRating) queryParams.append('minRating', filters.minRating.toString());
      queryParams.append('sortBy', filters.sortBy);

      const response = await fetch(`/api/agents/search?${queryParams.toString()}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setAgents(data.agents);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch agents');
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={fetchAgents}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">AI Agents Marketplace</h1>
          <p className="text-gray-600">
            Browse and discover AI agents built by our community
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <SearchFilters onSearch={handleSearch} initialFilters={filters} />
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No agents found</h3>
            <p className="text-gray-500">
              Try adjusting your search filters or check back later for new agents
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {agent.image_url && (
                  <div className="relative h-48">
                    <Image
                      src={agent.image_url}
                      alt={agent.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {agent.tag}
                    </span>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="ml-1 text-gray-600">
                        {agent.average_rating.toFixed(1)}
                      </span>
                      <span className="ml-1 text-gray-500">
                        ({agent.total_ratings})
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{agent.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{agent.description}</p>
                  <div className="flex items-center justify-between">
                    {agent.price ? (
                      <span className="text-xl font-bold text-blue-600">
                        ${agent.price}
                      </span>
                    ) : (
                      <span className="text-green-600 font-semibold">Free</span>
                    )}
                    <button
                      onClick={() => router.push(`/agent/${agent.id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 