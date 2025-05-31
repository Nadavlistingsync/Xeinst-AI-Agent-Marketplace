import { getDeployment } from "@/lib/db-helpers";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import { getAgentMetrics, getAgentLogs, getDeploymentFeedbacks } from "@/lib/db-helpers";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

type DeploymentParams = Promise<{ deploymentId: string }>;

export async function generateMetadata({ params }: { params: DeploymentParams }): Promise<Metadata> {
  const { deploymentId } = await params;
  const deployment = await getDeployment(deploymentId);
  
  return {
    title: deployment ? `${deployment.name} - Deployment Details` : 'Deployment Not Found',
    description: deployment?.description || 'View deployment details and configuration',
  };
}

export default async function Page({ params }: { params: DeploymentParams }) {
  const { deploymentId } = await params;
  const deployment = await getDeployment(deploymentId);

  if (!deployment) {
    notFound();
  }

  const metrics = await getAgentMetrics(deploymentId);
  const logs = await getAgentLogs(deploymentId);
  const feedbacks = await getDeploymentFeedbacks(deploymentId);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{deployment.name}</h1>
        <p className="text-muted-foreground">{deployment.description}</p>
        <div className="mt-4 flex items-center gap-4">
          <Badge variant="outline">{deployment.status}</Badge>
          <Badge variant="outline">{deployment.framework}</Badge>
          <Badge variant="outline">{deployment.environment}</Badge>
          <Badge variant="outline">{deployment.accessLevel}</Badge>
          <Badge variant="outline">{deployment.licenseType}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Deployment Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Configuration</h3>
              <pre className="mt-2 p-4 bg-muted rounded-lg overflow-auto">
                {JSON.stringify(deployment.config, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-medium">Created By</h3>
              <p>{deployment.deployer.name}</p>
            </div>
            <div>
              <h3 className="font-medium">Created At</h3>
              <p>{new Date(deployment.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="font-medium">Last Updated</h3>
              <p>{new Date(deployment.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Logs</h2>
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {log.level.toUpperCase()}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <p>{log.message}</p>
                {log.metadata && (
                  <pre className="mt-2 p-2 bg-muted rounded-lg overflow-auto text-sm">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">User Feedback</h2>
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <Card key={feedback.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium">
                      {feedback.user.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(feedback.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < feedback.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p>{feedback.content}</p>
                {feedback.response && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="font-medium">Response:</p>
                    <p className="mt-2">{feedback.response}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {new Date(feedback.responseDate).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 