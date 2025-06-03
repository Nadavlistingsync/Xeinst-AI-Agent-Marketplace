import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Play, Square, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

interface DeploymentsListProps {
  userId: string;
}

export async function DeploymentsList({ userId }: DeploymentsListProps) {
  const deployments = await prisma.deployment.findMany({
    where: { deployedBy: userId },
    include: {
      metrics: true,
    },
    orderBy: {
      createdAt: "desc",
    },
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
    <Card>
      <CardHeader>
        <CardTitle>Your Deployments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deployments.map((deployment) => (
            <div
              key={deployment.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="font-medium">{deployment.name}</h3>
                  <p className="text-sm text-gray-500">
                    Created {formatDistanceToNow(deployment.createdAt, { addSuffix: true })}
                  </p>
                </div>
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
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-500">
                  {deployment.metrics?.totalRequests || 0} requests
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/deployments/${deployment.id}`}>
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    {deployment.status === "active" ? (
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleStopDeployment(deployment.id)}
                      >
                        <Square className="h-4 w-4 mr-2" />
                        Stop Deployment
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => handleStartDeployment(deployment.id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Deployment
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteDeployment(deployment.id)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete Deployment
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
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

async function handleDeleteDeployment(id: string) {
  "use server";
  
  await prisma.deployment.delete({
    where: { id },
  });
} 