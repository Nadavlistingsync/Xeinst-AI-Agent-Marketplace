"use client";

import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Activity, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface MonitoringDashboardProps {
  agentId: string;
}

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ agentId }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Monitoring Dashboard</h2>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-green-500/20 mb-4">
            <Activity className="h-6 w-6 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">99.5%</div>
          <div className="text-sm text-white/70">Uptime</div>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-blue-500/20 mb-4">
            <Clock className="h-6 w-6 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">245ms</div>
          <div className="text-sm text-white/70">Avg Response</div>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-purple-500/20 mb-4">
            <TrendingUp className="h-6 w-6 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">1,234</div>
          <div className="text-sm text-white/70">Total Requests</div>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-red-500/20 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white">0.5%</div>
          <div className="text-sm text-white/70">Error Rate</div>
        </GlassCard>
      </div>

      {/* Status */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-4">Agent Status</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span className="text-white">Agent is running normally</span>
        </div>
      </GlassCard>
    </div>
  );
};
