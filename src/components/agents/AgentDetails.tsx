'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeedbackAnalysis } from '@/components/dashboard/FeedbackAnalysis';
import { FeedbackResponse } from '@/components/feedback/FeedbackResponse';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

interface AgentDetailsProps {
  agentId: string;
}

export function AgentDetails({ agentId }: AgentDetailsProps) {
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAgent = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}`);
      const data = await response.json();
      setAgent(data);
    } catch (error) {
      console.error('Error fetching agent:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgent();
  }, [agentId]);

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