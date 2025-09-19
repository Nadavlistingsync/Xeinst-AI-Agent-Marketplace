"use client";

import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui';
import { Play, Square, RotateCcw, Trash2, Bot } from 'lucide-react';

interface AgentPageProps {
  deployment: any;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onRestart: (id: string) => void;
  onDelete: (id: string) => void;
}

const AgentPage: React.FC<AgentPageProps> = ({ 
  deployment, 
  onStart, 
  onStop, 
  onRestart, 
  onDelete 
}) => {
  return (
    <div className="space-y-6">
      {/* Agent Header */}
      <GlassCard>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
              <Bot className="h-8 w-8 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{deployment.name}</h1>
              <p className="text-white/70">{deployment.description}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  deployment.status === 'active' 
                    ? 'bg-green-500/20 text-green-400' 
                    : deployment.status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {deployment.status}
                </span>
                <span className="text-white/50">•</span>
                <span className="text-white/70">{deployment.price} credits</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            {deployment.status === 'stopped' && (
              <Button onClick={() => onStart(deployment.id)} variant="glass">
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            )}
            {deployment.status === 'active' && (
              <Button onClick={() => onStop(deployment.id)} variant="glass">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}
            <Button onClick={() => onRestart(deployment.id)} variant="glass">
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart
            </Button>
            <Button onClick={() => onDelete(deployment.id)} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Agent Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">Configuration</h3>
          <div className="space-y-3">
            <div>
              <span className="text-white/70">Environment:</span>
              <span className="text-white ml-2">{deployment.environment || 'production'}</span>
            </div>
            <div>
              <span className="text-white/70">Framework:</span>
              <span className="text-white ml-2">{deployment.framework || 'Node.js'}</span>
            </div>
            <div>
              <span className="text-white/70">Model Type:</span>
              <span className="text-white ml-2">{deployment.modelType || 'GPT-4'}</span>
            </div>
            <div>
              <span className="text-white/70">Version:</span>
              <span className="text-white ml-2">{deployment.version || '1.0.0'}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
          <div className="space-y-3">
            <div>
              <span className="text-white/70">Downloads:</span>
              <span className="text-white ml-2">{deployment.downloadCount || 0}</span>
            </div>
            <div>
              <span className="text-white/70">Rating:</span>
              <span className="text-white ml-2">{deployment.rating || 'N/A'}/5</span>
            </div>
            <div>
              <span className="text-white/70">Total Ratings:</span>
              <span className="text-white ml-2">{deployment.totalRatings || 0}</span>
            </div>
            <div>
              <span className="text-white/70">Created:</span>
              <span className="text-white ml-2">
                {new Date(deployment.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AgentPage;
