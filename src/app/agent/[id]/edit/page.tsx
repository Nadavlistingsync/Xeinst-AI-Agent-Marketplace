"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import EditAgentForm from '@/components/EditAgentForm';
import { toast } from 'react-hot-toast';

interface Agent {
  id: string;
  name: string;
  description: string;
  tag: string;
  price?: number;
  long_description?: string;
  features?: string[];
  requirements?: string[];
  is_public: boolean;
}

export default function EditAgentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchAgent = async () => {
      try {
        const response = await fetch(`/api/agents/${id}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setAgent(data.agent);
      } catch (error) {
        toast.error('Failed to load agent details');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id, router, status]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>Agent not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-8">Edit Agent</h1>
            <EditAgentForm
              agent={agent}
              onSuccess={() => router.push(`/agent/${id}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 