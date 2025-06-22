'use client';

import { Card, CardContent } from '@/components/ui/card';
import { InteractiveAgentCard } from './InteractiveAgentCard';
import { Agent } from '@/app/api/agents/route';

interface MarketplaceGridProps {
  agents: Agent[];
}

export function MarketplaceGrid({ agents }: MarketplaceGridProps) {
  if (!agents || agents.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            No agents found.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map((agent) => (
        <InteractiveAgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
} 