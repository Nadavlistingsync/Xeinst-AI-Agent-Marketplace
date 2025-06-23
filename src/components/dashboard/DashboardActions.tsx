'use client';

import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

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

export function EditAgentButton({ agentId }: { agentId: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="hover:bg-green-100 hover:text-green-700 transition"
      onClick={() => window.location.href = `/agent/${agentId}/edit`}
    >
      <Edit className="w-4 h-4 mr-1" />
      Edit
    </Button>
  );
} 