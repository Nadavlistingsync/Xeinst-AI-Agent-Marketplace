"use client";

import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { BarChart3, TrendingUp, Activity, Zap } from 'lucide-react';

interface DeploymentMetricsProps {
  deploymentId: string;
}

export const DeploymentMetrics: React.FC<DeploymentMetricsProps> = ({ deploymentId }) => {
  return (
    <div className="space-y-6">
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-6">Performance Metrics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-blue-500/20 mb-4">
              <BarChart3 className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">1,234</div>
            <div className="text-sm text-white/70">Total Requests</div>
            <div className="text-xs text-green-400 mt-1">+12% from last week</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-purple-500/20 mb-4">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">98.5%</div>
            <div className="text-sm text-white/70">Success Rate</div>
            <div className="text-xs text-green-400 mt-1">+0.3% improvement</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-green-500/20 mb-4">
              <Activity className="h-6 w-6 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">45</div>
            <div className="text-sm text-white/70">Active Users</div>
            <div className="text-xs text-blue-400 mt-1">Currently online</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-yellow-500/20 mb-4">
              <Zap className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white">$24.50</div>
            <div className="text-sm text-white/70">Revenue Today</div>
            <div className="text-xs text-green-400 mt-1">+8% from yesterday</div>
          </div>
        </div>
      </GlassCard>

      {/* Usage Chart Placeholder */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-4">Usage Over Time</h3>
        <div className="h-64 flex items-center justify-center text-white/50">
          Chart visualization would go here
        </div>
      </GlassCard>
    </div>
  );
};
