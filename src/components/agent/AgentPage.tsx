"use client";

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RefreshCw, Trash2 } from 'lucide-react';
import { DeploymentWithMetrics } from '@/types/deployment';

interface AgentPageProps {
  deployment: DeploymentWithMetrics;
  onStart: (id: string) => Promise<void>;
  onStop: (id: string) => Promise<void>;
  onRestart: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function AgentPage({
  deployment,
  onStart,
  onStop,
  onRestart,
  onDelete
}: AgentPageProps) {
  const { data: session } = useSession();
  if (!session) {
    return null;
  }

  const isActive = deployment.status === 'active';
  const isPending = deployment.status === 'pending' || deployment.status === 'deploying';
  const metrics = deployment.metrics?.[0] || {
    errorRate: 0,
    responseTime: 0,
    uptime: 100,
    usage: {
      total: 0,
      last24h: 0
    }
  };

  const canAccess = () => {
    if (deployment.accessLevel === 'public') return true;
    if (deployment.createdBy === session.user.id) return true;
    if (deployment.accessLevel === 'basic' && session.user.subscriptionTier === 'basic') return true;
    if (deployment.accessLevel === 'premium' && session.user.subscriptionTier === 'premium') return true;
    return false;
  };

  if (!canAccess()) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{deployment.name}</h1>
            <p className="text-muted-foreground">{deployment.description}</p>
          </div>
          <Badge variant={isActive ? 'success' : isPending ? 'warning' : 'destructive'}>
            {deployment.status}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{metrics?.totalRequests || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{metrics?.averageResponseTime || 0}ms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{metrics?.errorRate || 0}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{metrics?.successRate || 0}%</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="rounded-lg bg-muted p-4">
              {JSON.stringify(deployment.config || {}, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {deployment.createdBy === session.user.id && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStart(deployment.id)}
              disabled={isActive || isPending}
            >
              <Play className="mr-2 h-4 w-4" />
              Start
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStop(deployment.id)}
              disabled={!isActive || isPending}
            >
              <Pause className="mr-2 h-4 w-4" />
              Stop
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestart(deployment.id)}
              disabled={!isActive || isPending}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Restart
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(deployment.id)}
              disabled={isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 