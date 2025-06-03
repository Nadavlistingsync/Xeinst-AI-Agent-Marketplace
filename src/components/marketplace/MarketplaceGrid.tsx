import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Deployment } from '@/types/deployment';
import { AgentCard } from './AgentCard';

interface MarketplaceGridProps {
  deployments: Deployment[];
  onDeploymentSelect?: (deployment: Deployment) => void;
}

export function MarketplaceGrid({ deployments, onDeploymentSelect }: MarketplaceGridProps) {
  const [filteredDeployments, setFilteredDeployments] = useState<Deployment[]>(deployments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    let filtered = deployments;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(query) || 
        d.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(d => d.category === selectedCategory);
    }

    setFilteredDeployments(filtered);
  }, [deployments, searchQuery, selectedCategory]);

  const categories = Array.from(new Set(deployments.map(d => d.category))).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {filteredDeployments.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              No agents found matching your criteria
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeployments.map((deployment) => (
            <AgentCard
              key={deployment.id}
              deployment={deployment}
              onClick={() => onDeploymentSelect?.(deployment)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 