'use client';

import { Search } from 'lucide-react';
import { Star } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Session } from 'next-auth';
import { signIn } from 'next-auth/react';
import { ErrorBoundary } from './ErrorBoundary';
import { CardSkeleton } from './LoadingSkeleton';
import { toast } from 'react-hot-toast';
import { fetchApi } from '@/lib/api';

interface Agent {
  id: number;
  name: string;
  description: string;
  tag: string;
  rating: number;
  price?: number;
  image_url?: string;
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
      const { data, error } = await fetchApi<{ products: Agent[] }>('/api/list-products');
      
      if (error) {
        throw new Error(error);
      }

      if (data) {
        setAgents(data.products);
        setError(null);
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
      <section className="py-20 glass-section">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">AI Agents Marketplace</h2>
          <p className="text-xl text-gray-600 mb-8">
            Sign up or sign in with GitHub to access and deploy AI agents.
          </p>
          <button
            onClick={() => signIn('github', { callbackUrl: '/marketplace' })}
            className="inline-flex items-center justify-center bg-[#24292F] text-white py-3 px-6 rounded-lg hover:bg-[#1B1F23] transition-colors duration-300 text-lg font-semibold mx-auto"
          >
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.41-5.27 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z"/></svg>
            Continue with GitHub
          </button>
        </div>
      </section>
    );
  }

  return (
    <ErrorBoundary>
      <section className="py-20 glass-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">AI Agents Marketplace</h2>
            <p className="text-xl text-gray-600 mb-8">
              Browse ready-made AI agents built from real client requests — automate your workflow in seconds.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Agent Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <CardSkeleton count={6} />
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchAgents}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="glass-card card-hover p-6"
                  >
                    {agent.image_url && (
                      <div className="mb-4 relative w-full h-48">
                        <Image
                          src={agent.image_url}
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
                    <div className="flex items-center justify-between">
                      {agent.price && (
                        <span className="text-xl font-bold text-blue-600">
                          ${agent.price}
                        </span>
                      )}
                      <button
                        onClick={() => handleViewAgent(agent.id)}
                        className="btn-primary py-2 px-4 text-sm"
                      >
                        View Agent
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredAgents.length === 0 && (
                <div className="text-center mt-12">
                  <p className="text-gray-600 text-lg">No agents found matching your search.</p>
                </div>
              )}

              {/* Explore All Button */}
              {searchQuery && (
                <div className="text-center mt-12">
                  <button
                    onClick={() => setSearchQuery('')}
                    className="btn-secondary border-2 border-blue-600 py-3 px-8"
                  >
                    Show All Agents
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </ErrorBoundary>
  );
} 