import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DeploymentWithMetrics } from "../../types/deployment";
import { DeploymentStatus } from "@prisma/client";
import { prisma } from '../../lib/prisma';

interface DeploymentOverviewProps {
  deployment: DeploymentWithMetrics;
  onStart: (id: string) => Promise<void>;
  onStop: (id: string) => Promise<void>;
  onRestart: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const DeploymentOverview = ({
  deployment,
  onStart,
  onStop,
  onRestart,
  onDelete,
}: DeploymentOverviewProps) => {
  const getStatusColor = (status: DeploymentStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Deployment Overview</CardTitle>
          <Badge className={getStatusColor(deployment.status)}>
            {deployment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1">{deployment.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <p className="mt-1">
                {new Date(deployment.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Environment</h3>
              <p className="mt-1">{deployment.environment}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Framework</h3>
              <p className="mt-1">{deployment.framework}</p>
            </div>
          </div>

          <div className="flex space-x-2">
            {deployment.status === 'stopped' && (
              <Button onClick={() => onStart(deployment.id)}>Start</Button>
            )}
            {deployment.status === 'active' && (
              <Button onClick={() => onStop(deployment.id)}>Stop</Button>
            )}
            {deployment.status === 'active' && (
              <Button onClick={() => onRestart(deployment.id)}>Restart</Button>
            )}
            <Button
              variant="destructive"
              onClick={() => onDelete(deployment.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export async function handleStartDeployment(id: string) {
  "use server";
  
  if (!prisma) {
    throw new Error('Prisma client not initialized');
  }

  await prisma.deployment.update({
    where: { id },
    data: { status: 'active' },
  });
}

export async function handleStopDeployment(id: string) {
  "use server";
  
  if (!prisma) {
    throw new Error('Prisma client not initialized');
  }

  await prisma.deployment.update({
    where: { id },
    data: { status: 'stopped' },
  });
}

export async function handleRestartDeployment(id: string) {
  "use server";
  
  if (!prisma) {
    throw new Error('Prisma client not initialized');
  }

  await prisma.deployment.update({
    where: { id },
    data: { status: 'pending' },
  });
  
  // Wait a moment before setting to active
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  await prisma.deployment.update({
    where: { id },
    data: { status: 'active' },
  });
} 