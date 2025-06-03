'use client';

import { useState } from "react";
import { Deployment } from "@/types/deployment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface DeploymentActionsProps {
  deployment: Deployment;
  onActionComplete?: () => void;
}

export function DeploymentActions({ deployment, onActionComplete }: DeploymentActionsProps) {
  const [deploymentName, setDeploymentName] = useState("");
  const [environment, setEnvironment] = useState("production");
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDeploy = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/deployments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId: deployment.id,
          name: deploymentName,
          environment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to deploy agent");
      }

      const data = await response.json();
      
      toast({
        description: "Your agent has been deployed successfully.",
        variant: "default"
      });

      router.push(`/dashboard/deployments/${data.id}`);
    } catch (error) {
      toast({
        description: "There was an error deploying your agent. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/deployments/${deployment.id}/${action}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} deployment`);
      }

      toast({
        description: `Deployment ${action}ed successfully`,
        variant: "default"
      });
      onActionComplete?.();
    } catch (error) {
      toast({
        description: `Failed to ${action} deployment`,
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deploy Agent</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="deployment-name">Deployment Name</Label>
            <Input
              id="deployment-name"
              value={deploymentName}
              onChange={(e) => setDeploymentName(e.target.value)}
              placeholder="Enter a name for your deployment"
            />
          </div>

          <div>
            <Label htmlFor="environment">Environment</Label>
            <Select value={environment} onValueChange={setEnvironment}>
              <SelectTrigger>
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4">
            <Button
              className="w-full"
              onClick={handleDeploy}
              disabled={isLoading || !deploymentName}
            >
              {isLoading ? "Deploying..." : "Deploy Agent"}
            </Button>
          </div>

          <div className="text-sm text-gray-500">
            <p className="mb-2">Deployment Details:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Framework: {deployment.framework}</li>
              <li>Model Type: {deployment.modelType}</li>
              <li>Access Level: {deployment.accessLevel}</li>
              <li>License Type: {deployment.licenseType}</li>
              <li>Status: {deployment.status}</li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={() => handleAction('start')}
              disabled={isLoading || deployment.status === 'active'}
              variant="default"
            >
              Start
            </Button>
            <Button
              onClick={() => handleAction('stop')}
              disabled={isLoading || deployment.status === 'stopped'}
              variant="destructive"
            >
              Stop
            </Button>
            <Button
              onClick={() => handleAction('restart')}
              disabled={isLoading}
              variant="outline"
            >
              Restart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 