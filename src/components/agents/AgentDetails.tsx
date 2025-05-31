'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeedbackAnalysis } from '@/components/dashboard/FeedbackAnalysis';
import { FeedbackResponse } from '@/components/feedback/FeedbackResponse';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { toast } from 'react-hot-toast';

interface AgentDetailsProps {
  agentId: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  status: string;
  access_level: string;
  deployed_by: string;
}

export function AgentDetails({ agentId }: AgentDetailsProps) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAgent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/agents/${agentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch agent');
      }
      const data = await response.json();
      setAgent(data);
    } catch (error) {
      console.error('Error fetching agent:', error);
      toast.error('Failed to load agent details');
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    if (agentId) {
      fetchAgent();
    }
  }, [agentId, fetchAgent]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!agent) {
    return <div>Agent not found</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{agent.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{agent.description}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feedback">Feedback Analysis</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="feedback">
          <FeedbackAnalysis agentId={agentId} />
        </TabsContent>
        <TabsContent value="responses">
          <FeedbackResponse 
            feedbackId={agentId}
            onResponseSubmitted={() => {
              // Refresh the agent data after response is submitted
              fetchAgent();
            }}
          />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationCenter agentId={agentId} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 