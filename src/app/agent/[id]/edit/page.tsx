"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import EditAgentForm from '@/components/EditAgentForm';
import { toast } from 'react-hot-toast';
import { Agent } from '@/types/agent';

export default function EditAgentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { status } = useSession();
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
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch agent');
        }
        
        setAgent(data.agent);
      } catch (error) {
        console.error('Error fetching agent:', error);
        toast.error('Failed to load agent details');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchAgent();
    }
  }, [id, router, status]);

  if (status === 'loading' || loading) {
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
          <p>Agent not found or you don't have permission to edit it</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Edit Agent</h1>
              <p className="text-gray-600 mt-2">
                Update your agent's information and settings
              </p>
            </div>
            
            <EditAgentForm
              agent={agent}
              onSuccess={() => {
                toast.success('Agent updated successfully!');
                router.push(`/agent/${id}`);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 