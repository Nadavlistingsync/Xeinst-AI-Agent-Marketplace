"use client";

import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Bot, Activity, Clock, AlertCircle } from 'lucide-react';

interface DeploymentOverviewProps {
  deploymentId: string;
}

export const DeploymentOverview: React.FC<DeploymentOverviewProps> = ({ deploymentId }) => {
  return (
    <div className="space-y-6">
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-6">Deployment Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-green-500/20 mb-4">
              <Bot className="h-6 w-6 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">Active</div>
            <div className="text-sm text-white/70">Status</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-blue-500/20 mb-4">
              <Activity className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">99.9%</div>
            <div className="text-sm text-white/70">Uptime</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-purple-500/20 mb-4">
              <Clock className="h-6 w-6 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">125ms</div>
            <div className="text-sm text-white/70">Response Time</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-red-500/20 mb-4">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-white">0.1%</div>
            <div className="text-sm text-white/70">Error Rate</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
