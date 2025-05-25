"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import Image from 'next/image';
import AgentReviews from '@/components/AgentReviews';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface Agent {
  id: number;
  name: string;
  description: string;
  tag: string;
  rating: number;
  price?: number;
  image_url?: string;
  long_description?: string;
  features?: string[];
  requirements?: string[];
  average_rating?: number;
  total_ratings?: number;
  created_by: string;
}

export default function AgentPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await fetch(`/api/list-products?id=${params.id}`);
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setAgent(data.products[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch agent details');
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/agents/${params.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      toast.success('Agent deleted successfully');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete agent');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error || 'Agent not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {agent.image_url && (
            <div className="w-full h-64 md:h-96 relative">
              <Image
                src={agent.image_url}
                alt={agent.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            </div>
          )}
          
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
                <div className="flex items-center">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mr-4">
                    {agent.tag}
                  </span>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="ml-1 text-gray-600">{agent.rating}</span>
                  </div>
                </div>
              </div>
              {agent.price && (
                <div className="text-3xl font-bold text-blue-600">
                  ${agent.price}
                </div>
              )}
            </div>

            <p className="text-gray-600 text-lg mb-8">{agent.description}</p>

            {agent.long_description && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">About this Agent</h2>
                <p className="text-gray-600">{agent.long_description}</p>
              </div>
            )}

            {agent.features && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Features</h2>
                <ul className="list-disc list-inside space-y-2">
                  {agent.features.map((feature, index) => (
                    <li key={index} className="text-gray-600">{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {agent.requirements && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Requirements</h2>
                <ul className="list-disc list-inside space-y-2">
                  {agent.requirements.map((requirement, index) => (
                    <li key={index} className="text-gray-600">{requirement}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              {session?.user?.email === agent.created_by ? (
                <>
                  <button
                    onClick={() => router.push(`/agent/${agent.id}/edit`)}
                    className="bg-white text-blue-600 border-2 border-blue-600 py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors duration-300"
                  >
                    Edit Agent
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 text-white py-3 px-8 rounded-lg hover:bg-red-700 transition-colors duration-300 disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Agent'}
                  </button>
                </>
              ) : (
                <>
                  <button className="bg-white text-blue-600 border-2 border-blue-600 py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors duration-300">
                    Contact Seller
                  </button>
                  <button className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                    Purchase Agent
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Reviews & Ratings</h2>
          <AgentReviews
            agentId={String(agent.id)}
            averageRating={agent.average_rating || 0}
            totalRatings={agent.total_ratings || 0}
          />
        </div>
      </div>
    </div>
  );
} 