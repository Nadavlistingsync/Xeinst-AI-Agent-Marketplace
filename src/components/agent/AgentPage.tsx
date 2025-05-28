"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AgentPageProps {
  agentId: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  framework: string;
  version: string;
  status: string;
  api_endpoint?: string;
  access_level: 'public' | 'basic' | 'premium';
  license_type: 'full-access' | 'limited-use' | 'view-only' | 'non-commercial';
  price_cents: number;
  uploaded_by: string;
  users: {
    email: string;
    full_name: string;
  };
}

export function AgentPage({ agentId }: AgentPageProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);

  const fetchAgentDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch agent details');
      }
      const data = await response.json();
      setAgent(data);
    } catch (error) {
      console.error('Error fetching agent details:', error);
      toast({
        title: 'Error loading agent',
        description: 'Failed to load agent details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [agentId, toast]);

  useEffect(() => {
    fetchAgentDetails();
  }, [fetchAgentDetails]);

  const handleDownload = async () => {
    if (!session) {
      setShowSubscribeDialog(true);
      return;
    }

    try {
      const response = await fetch(`/api/agents/${agentId}/download`);
      if (!response.ok) {
        throw new Error('Failed to download agent');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${agent?.name || 'agent'}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Download started',
        description: 'Your agent is being downloaded.',
      });
    } catch (error) {
      console.error('Error downloading agent:', error);
      toast({
        title: 'Download failed',
        description: 'Failed to download the agent. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Loading agent details...</div>;
  }

  if (!agent) {
    return <div>Agent not found</div>;
  }

  const canAccess = () => {
    if (!session) return false;
    if (agent.access_level === 'public') return true;
    if (agent.access_level === 'basic' && session.user.subscription_tier === 'basic') return true;
    if (agent.access_level === 'premium' && session.user.subscription_tier === 'premium') return true;
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{agent.name}</h1>
          <p className="text-gray-500">by {agent.users.full_name}</p>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => window.location.href = `/agent/${agentId}/edit`}
          >
            Edit
          </Button>
          <Button onClick={handleDownload} disabled={!canAccess()}>
            Download
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Description</h2>
            <p className="text-gray-600">{agent.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Framework</h3>
              <p className="text-gray-600">{agent.framework}</p>
            </div>
            <div>
              <h3 className="font-medium">Version</h3>
              <p className="text-gray-600">{agent.version}</p>
            </div>
            <div>
              <h3 className="font-medium">License</h3>
              <p className="text-gray-600">{agent.license_type}</p>
            </div>
            <div>
              <h3 className="font-medium">Access Level</h3>
              <p className="text-gray-600">{agent.access_level}</p>
            </div>
          </div>

          {agent.api_endpoint && (
            <div>
              <h3 className="font-medium">API Endpoint</h3>
              <p className="text-gray-600">{agent.api_endpoint}</p>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscription Required</DialogTitle>
            <DialogDescription>
              This agent requires a {agent.access_level} subscription to access.
              Would you like to upgrade your subscription?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowSubscribeDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => window.location.href = '/pricing'}>
              Upgrade
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 