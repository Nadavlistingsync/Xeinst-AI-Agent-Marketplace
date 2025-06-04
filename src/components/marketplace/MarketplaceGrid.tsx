import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Deployment } from '@/types/deployment';
import { AgentCard } from './AgentCard';

interface MarketplaceGridProps {
  searchParams: {
    query?: string;
    framework?: string;
    category?: string;
    accessLevel?: string;
    minPrice?: string;
    maxPrice?: string;
    verified?: string;
    popular?: string;
    new?: string;
  };
}

export function MarketplaceGrid({ searchParams }: MarketplaceGridProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeployments = async () => {
      try {
        const queryParams = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });

        const response = await fetch(`/api/deployments?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch deployments');
        
        const data = await response.json();
        setDeployments(data);
      } catch (error) {
        console.error('Error fetching deployments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeployments();
  }, [searchParams]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            Loading deployments...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {deployments.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              No agents found matching your criteria
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deployments.map((deployment) => (
            <AgentCard
              key={deployment.id}
              deployment={deployment}
            />
          ))}
        </div>
      )}
    </div>
  );
} 