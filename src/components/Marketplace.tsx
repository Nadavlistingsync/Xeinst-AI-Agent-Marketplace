"use client";

import { Search } from 'lucide-react';
import { Star } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Session } from 'next-auth';
import { signIn } from 'next-auth/react';
import { PageSkeleton } from './LoadingSkeleton';
import { toast } from 'react-hot-toast';
import { fetchApi } from '@/lib/api';

interface Agent {
  id: number;
  name: string;
  description: string;
  tag: string;
  rating: number;
  price?: number;
  imageUrl?: string;
}

interface MarketplaceProps {
  session: Session | null;
}

export default function Marketplace({ session }: MarketplaceProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await fetchApi<{ products: Agent[] }>('/api/list-products');
      
      if (error) {
        throw new Error(error);
      }

      if (data) {
        setAgents(data.products);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch agents';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchAgents();
    } else {
      setLoading(false);
    }
  }, [session, fetchAgents]);

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    agent.tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  const handleViewAgent = (agentId: number) => {
    router.push(`/agent/${agentId}`);
  };

  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Sign in to view agents</h2>
        <button
          onClick={() => signIn()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchAgents}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative">
        <input
          type="text"
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            className="glass-card card-hover p-6"
          >
            {agent.imageUrl && (
              <div className="mb-4 relative w-full h-48">
                <Image
                  src={agent.imageUrl}
                  alt={agent.name}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {agent.tag}
              </span>
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="ml-1 text-gray-600">{agent.rating}</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">{agent.name}</h3>
            <p className="text-gray-600 mb-4">{agent.description}</p>
            <button
              onClick={() => handleViewAgent(agent.id)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 