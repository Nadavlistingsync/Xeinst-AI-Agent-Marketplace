"use client";

import React from 'react';
import { PageHeader } from '../../../design-system/components/PageHeader';
import { Button } from '../../../design-system/components/Button';
import { Upload, Sparkles } from 'lucide-react';

interface MarketplaceHeaderProps {
  totalAgents: number;
  totalCategories: number;
  averageRating: number;
}

export function MarketplaceHeader({ 
  totalAgents, 
  totalCategories, 
  averageRating 
}: MarketplaceHeaderProps) {
  const stats = [
    { 
      label: 'AI Agents', 
      value: totalAgents.toLocaleString(),
      trend: 'up' as const
    },
    { 
      label: 'Categories', 
      value: totalCategories 
    },
    { 
      label: 'Avg Rating', 
      value: averageRating.toFixed(1) 
    },
    { 
      label: 'Active Users', 
      value: '12.5K',
      trend: 'up' as const
    },
  ];

  return (
    <PageHeader
      title="AI Agent Marketplace"
      subtitle="Discover, deploy, and monetize intelligent automation"
      description="Browse our curated collection of AI agents designed to streamline your workflow and boost productivity."
      stats={stats}
      actions={
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="primary" 
            size="lg"
            leftIcon={<Upload className="w-5 h-5" />}
            href="/upload"
          >
            Upload Agent
          </Button>
          <Button 
            variant="glass" 
            size="lg"
            leftIcon={<Sparkles className="w-5 h-5" />}
            href="/agent-builder"
          >
            AI Builder
          </Button>
        </div>
      }
    />
  );
}
