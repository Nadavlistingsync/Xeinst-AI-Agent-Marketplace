import { Deployment } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayIcon, StopIcon, RefreshCwIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DeploymentOverviewProps {
  deployment: Deployment;
}

export function DeploymentOverview({ deployment }: DeploymentOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{deployment.name}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Created {formatDistanceToNow(deployment.createdAt, { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                deployment.status === "active"
                  ? "success"
                  : deployment.status === "failed"
                  ? "destructive"
                  : "secondary"
              }
            >
              {deployment.status}
            </Badge>
            {deployment.status === "active" ? (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleStopDeployment(deployment.id)}
              >
                <StopIcon className="h-4 w-4 mr-2" />
                Stop
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartDeployment(deployment.id)}
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                Start
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestartDeployment(deployment.id)}
            >
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Restart
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Framework</h3>
            <p className="mt-1">{deployment.framework}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Version</h3>
            <p className="mt-1">{deployment.version}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Environment</h3>
            <p className="mt-1 capitalize">{deployment.environment}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Access Level</h3>
            <p className="mt-1 capitalize">{deployment.accessLevel}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
          <p className="text-gray-600">{deployment.description}</p>
        </div>

        {deployment.requirements && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Requirements</h3>
            <ul className="list-disc list-inside text-gray-600">
              {deployment.requirements.split("\n").map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
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