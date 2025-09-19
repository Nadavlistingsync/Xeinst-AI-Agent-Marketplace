"use client";

import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Users, Bot, AlertCircle, DollarSign } from 'lucide-react';

interface AdminDashboardProps {
  stats: {
    totalUsers: number;
    totalAgents: number;
    totalDisputes: number;
    totalPayouts: number;
    pendingDisputes: number;
    pendingAgents: number;
  };
  recentAuditLogs: any[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, recentAuditLogs }) => {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-blue-500/20 mb-4">
            <Users className="h-6 w-6 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
          <div className="text-sm text-white/70">Total Users</div>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-green-500/20 mb-4">
            <Bot className="h-6 w-6 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalAgents}</div>
          <div className="text-sm text-white/70">Total Agents</div>
          <div className="text-xs text-white/50 mt-1">{stats.pendingAgents} pending</div>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-red-500/20 mb-4">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalDisputes}</div>
          <div className="text-sm text-white/70">Total Disputes</div>
          <div className="text-xs text-white/50 mt-1">{stats.pendingDisputes} pending</div>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-yellow-500/20 mb-4">
            <DollarSign className="h-6 w-6 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalPayouts}</div>
          <div className="text-sm text-white/70">Total Payouts</div>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-6">Recent Audit Logs</h3>
        {recentAuditLogs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-white/70">No recent activity</div>
          </div>
        ) : (
          <div className="space-y-4">
            {recentAuditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <div className="font-medium text-white">{log.action}</div>
                  <div className="text-sm text-white/70">
                    by {log.actor?.name || log.actor?.email}
                  </div>
                </div>
                <div className="text-xs text-white/50">
                  {new Date(log.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};
