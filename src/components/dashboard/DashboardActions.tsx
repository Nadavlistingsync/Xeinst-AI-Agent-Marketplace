'use client';

import { Button } from '@/components/ui/button';

export function CreateAgentButton() {
  return (
    <Button
      onClick={() => window.location.href = '/agent-builder'}
      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-purple-600 transition"
      size="lg"
    >
      + Create New Agent
    </Button>
  );
}

export function ViewAgentButton({ agentId }: { agentId: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="hover:bg-blue-100 hover:text-blue-700 transition"
      onClick={() => window.location.href = `/agent/${agentId}`}
    >
      View
    </Button>
  );
} 