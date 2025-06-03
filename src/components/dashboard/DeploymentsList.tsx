import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Trash, RefreshCw } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { DeploymentWithMetrics } from '@/types/deployment';

interface DeploymentsListProps {
  userId: string;
}

export const DeploymentsList = async ({ userId }: DeploymentsListProps) => {
  const deployments = await prisma.deployment.findMany({
    where: {
      createdBy: userId
    },
    include: {
      metrics: {
        orderBy: {
          timestamp: 'desc'
        },
        take: 1
      }
    }
  });

  if (deployments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No Deployments Yet</h3>
            <p className="text-gray-500 mt-2">
              Deploy your first AI agent to get started
            </p>
            <Button asChild className="mt-4">
              <Link href="/marketplace">Browse Marketplace</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {deployments.map((deployment) => {
        const isActive = deployment.status === 'active';
        const isPending = deployment.status === 'pending' || deployment.status === 'deploying';
        const metrics = deployment.metrics?.[0];

        return (
          <Card key={deployment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{deployment.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{deployment.description}</p>
                </div>
                <Badge variant={isActive ? 'success' : isPending ? 'warning' : 'destructive'}>
                  {deployment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium">Environment</p>
                    <p className="mt-1">{deployment.environment}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Framework</p>
                    <p className="mt-1">{deployment.framework}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Requests</p>
                    <p className="mt-1">{metrics?.totalRequests || 0} requests</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="mt-1">{formatDistanceToNow(new Date(deployment.createdAt), { addSuffix: true })}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartDeployment(deployment.id)}
                    disabled={isActive || isPending}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStopDeployment(deployment.id)}
                    disabled={!isActive || isPending}
                  >
                    <Square className="mr-2 h-4 w-4" />
                    Stop
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestartDeployment(deployment.id)}
                    disabled={!isActive || isPending}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Restart
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteDeployment(deployment.id)}
                    disabled={isPending}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

async function handleStartDeployment(id: string) {
  "use server";
  
  await prisma.deployment.update({
    where: { id },
    data: { status: "active" },
  });
}

async function handleStopDeployment(id: string) {
  "use server";
  
  await prisma.deployment.update({
    where: { id },
    data: { status: "stopped" },
  });
}

async function handleRestartDeployment(id: string) {
  "use server";
  
  await prisma.deployment.update({
    where: { id },
    data: { status: "pending" },
  });
  
  // Wait a moment before setting to active
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  await prisma.deployment.update({
    where: { id },
    data: { status: "active" },
  });
}

async function handleDeleteDeployment(id: string) {
  "use server";
  
  await prisma.deployment.delete({
    where: { id },
  });
} 