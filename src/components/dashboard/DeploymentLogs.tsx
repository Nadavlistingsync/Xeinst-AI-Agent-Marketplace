"use client";

import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Terminal, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface DeploymentLogsProps {
  deploymentId: string;
}

const mockLogs = [
  { id: 1, level: 'info', message: 'Agent started successfully', timestamp: new Date().toISOString() },
  { id: 2, level: 'success', message: 'Processing request from user 123', timestamp: new Date().toISOString() },
  { id: 3, level: 'warning', message: 'High memory usage detected', timestamp: new Date().toISOString() },
  { id: 4, level: 'info', message: 'Request completed in 125ms', timestamp: new Date().toISOString() },
  { id: 5, level: 'error', message: 'Failed to connect to external API', timestamp: new Date().toISOString() },
];

export const DeploymentLogs: React.FC<DeploymentLogsProps> = ({ deploymentId }) => {
  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'success':
        return 'text-green-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex items-center space-x-2 mb-6">
          <Terminal className="h-5 w-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Deployment Logs</h3>
        </div>
        
        <div className="bg-black/30 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
          {mockLogs.map((log) => (
            <div key={log.id} className="flex items-start space-x-3 py-2 border-b border-white/5 last:border-b-0">
              <div className="flex-shrink-0 mt-0.5">
                {getLogIcon(log.level)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`text-xs font-medium ${getLogColor(log.level)} uppercase`}>
                    {log.level}
                  </span>
                  <span className="text-xs text-white/50">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-white/80 text-sm">{log.message}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
