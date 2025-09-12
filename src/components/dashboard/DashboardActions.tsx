'use client';

import { Button } from "../ui/button";
import { Edit, Eye, Plus } from 'lucide-react';

export function CreateAgentButton() {
  return (
    <Button
      onClick={() => window.location.href = '/agent-builder'}
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 rounded-xl px-6 py-3 flex items-center gap-2"
      size="lg"
    >
      <Plus className="w-5 h-5" />
      Create New Agent
    </Button>
  );
}

export function ViewAgentButton({ agentId }: { agentId: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 rounded-lg px-3 py-2 flex items-center gap-2"
      onClick={() => window.location.href = `/agent/${agentId}`}
    >
      <Eye className="w-4 h-4" />
      View
    </Button>
  );
}

export function EditAgentButton({ agentId }: { agentId: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 rounded-lg px-3 py-2 flex items-center gap-2"
      onClick={() => window.location.href = `/agent/${agentId}/edit`}
    >
      <Edit className="w-4 h-4" />
      Edit
    </Button>
  );
} 