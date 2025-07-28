import { useEffect, useState } from 'react';

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  fileUrl: string;
  version: string;
  environment: string;
  framework: string;
  modelType: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export function FeaturedAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        if (!response.ok) {
          throw new Error('Failed to fetch agents');
        }
        const data = await response.json();
        setAgents(data.agents || data); // Handle both new and old response formats
      } catch (err) {
        setError('Error loading agents');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (agents.length === 0) {
    return <div>No agents found</div>;
  }

  return (
    <div>
      {agents.map((agent) => (
        <div key={agent.id}>
          <h3>{agent.name}</h3>
          <p>{agent.description}</p>
          <p>Category: {agent.category}</p>
          <p>Price: ${agent.price}</p>
        </div>
      ))}
    </div>
  );
} 