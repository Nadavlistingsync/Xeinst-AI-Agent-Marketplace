"use client";

import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RefreshCw, Trash2, Download, Coins } from 'lucide-react';
import { DeploymentWithMetrics } from '@/types/deployment';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

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
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownload = async () => {
    if (!session) {
      signIn();
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(`/api/agents/${deployment.id}/download`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deployment.name}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started!');
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('Insufficient credits')) {
        toast.error(
          (t) => (
            <span className="flex items-center justify-between w-full">
              <span>Insufficient credits.</span>
              <Link href="/pricing">
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-4"
                  onClick={() => toast.dismiss(t.id)}
                >
                  Buy Credits
                </Button>
              </Link>
            </span>
          ),
          { duration: 6000 }
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Run handler
  const handleRun = async () => {
    if (!session) {
      signIn();
      return;
    }
    // Run logic here (e.g., call run endpoint)
    // ...
    toast.info('Run functionality is not yet implemented.');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{deployment.name}</h1>
            <p className="text-muted-foreground">{deployment.description}</p>
          </div>
          <Badge variant={deployment.status === 'active' ? 'success' : deployment.status === 'pending' || deployment.status === 'deploying' ? 'warning' : 'destructive'}>
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

        {deployment.createdBy === session?.user.id && (
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

        <div className="flex gap-4 mt-4">
          <Button onClick={handleDownload} variant="outline" disabled={isDownloading}>
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? 'Downloading...' : `Download for ${deployment.price ?? 0} credits`}
            {deployment.price && deployment.price > 0 && <Coins className="ml-2 h-4 w-4" />}
          </Button>
          <Button onClick={handleRun} variant="default">
            Run Agent
          </Button>
        </div>
      </div>
    </div>
  );
} 