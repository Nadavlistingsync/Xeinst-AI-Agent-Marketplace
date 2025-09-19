"use client";

import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Bot, Star, Download, Clock } from 'lucide-react';

interface AgentDetailsProps {
  agentId: string;
}

export const AgentDetails: React.FC<AgentDetailsProps> = ({ agentId }) => {
  return (
    <div className="space-y-6">
      {/* Agent Overview */}
      <GlassCard>
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
            <Bot className="h-8 w-8 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Agent Details</h2>
            <p className="text-white/70">Detailed information about this agent</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-yellow-500/20 mb-3">
              <Star className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white">4.8</div>
            <div className="text-sm text-white/70">Average Rating</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-blue-500/20 mb-3">
              <Download className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">1,234</div>
            <div className="text-sm text-white/70">Total Downloads</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-green-500/20 mb-3">
              <Clock className="h-6 w-6 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">245ms</div>
            <div className="text-sm text-white/70">Avg Response Time</div>
          </div>
        </div>
      </GlassCard>

      {/* Additional Details */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-4">Agent Information</h3>
        <div className="text-white/70">
          <p>This agent provides automated assistance for various tasks.</p>
          <p className="mt-2">Agent ID: {agentId}</p>
        </div>
      </GlassCard>
    </div>
  );
};
