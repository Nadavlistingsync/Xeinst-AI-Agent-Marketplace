import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  description: string;
  framework: string;
  version: string;
  status: string;
  access_level: 'public' | 'basic' | 'premium';
  license_type: 'full-access' | 'limited-use' | 'view-only' | 'non-commercial';
  price_cents: number;
  users: {
    email: string;
    name: string;
  };
}

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const { data: session } = useSession();

  const canAccess = () => {
    if (!session) return agent.access_level === 'public';
    if (agent.access_level === 'public') return true;
    if (agent.access_level === 'basic' && session.user.subscription_tier === 'basic') return true;
    if (agent.access_level === 'premium' && session.user.subscription_tier === 'premium') return true;
    return false;
  };

  return (
    <Link href={`/agent/${agent.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold line-clamp-1">{agent.name}</h3>
            <Badge
              variant={
                agent.access_level === 'public'
                  ? 'default'
                  : agent.access_level === 'basic'
                  ? 'secondary'
                  : 'destructive'
              }
            >
              {agent.access_level}
            </Badge>
          </div>

          <p className="text-gray-600 line-clamp-2">{agent.description}</p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{agent.framework}</Badge>
            <Badge variant="outline">{agent.license_type}</Badge>
            {agent.price_cents > 0 && (
              <Badge variant="outline">
                ${(agent.price_cents / 100).toFixed(2)}
              </Badge>
            )}
          </div>

          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>by {agent.users.name}</span>
            <span>v{agent.version}</span>
          </div>

          {!canAccess() && (
            <div className="mt-4 p-2 bg-yellow-50 text-yellow-800 rounded-md text-sm">
              Requires {agent.access_level} subscription
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
} 