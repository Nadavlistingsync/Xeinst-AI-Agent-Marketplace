import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { DeploymentWithMetrics } from '@/types/deployment';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { DeploymentStatus } from '@prisma/client';
import Image from 'next/image';

export default async function DeploymentPage({
  params
}: {
  params: { deploymentId: string }
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    notFound();
  }

  const deployment = await prisma.deployment.findUnique({
    where: { id: params.deploymentId },
    include: {
      creator: {
        select: {
          name: true,
          image: true
        }
      },
      deployer: {
        select: {
          name: true,
          image: true
        }
      },
      feedbacks: {
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        }
      },
      metrics: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!deployment) {
    notFound();
  }

  const deploymentWithMetrics: DeploymentWithMetrics = {
    id: deployment.id,
    name: deployment.name,
    status: deployment.status as DeploymentStatus,
    description: deployment.description || '',
    accessLevel: deployment.accessLevel,
    licenseType: deployment.licenseType,
    environment: deployment.environment,
    framework: deployment.framework,
    modelType: deployment.modelType,
    source: deployment.source || '',
    deployedBy: deployment.deployedBy,
    createdBy: deployment.createdBy,
    rating: deployment.rating || 0,
    totalRatings: deployment.totalRatings || 0,
    downloadCount: deployment.downloadCount || 0,
    startDate: deployment.startDate || new Date(),
    createdAt: deployment.createdAt,
    updatedAt: deployment.updatedAt,
    isPublic: deployment.isPublic,
    version: deployment.version || '1.0.0',
    health: deployment.health || {},
    metrics: deployment.metrics.map(metric => ({
      id: metric.id,
      createdAt: metric.createdAt,
      updatedAt: metric.updatedAt,
      deploymentId: metric.deploymentId,
      errorRate: metric.errorRate,
      responseTime: metric.responseTime,
      successRate: metric.successRate,
      totalRequests: metric.totalRequests,
      activeUsers: metric.activeUsers,
      averageResponseTime: metric.averageResponseTime,
      requestsPerMinute: metric.requestsPerMinute,
      averageTokensUsed: metric.averageTokensUsed,
      costPerRequest: metric.costPerRequest,
      totalCost: metric.totalCost,
      lastUpdated: metric.lastUpdated
    })),
    feedbacks: deployment.feedbacks.map(feedback => ({
      id: feedback.id,
      rating: feedback.rating,
      comment: feedback.comment,
      sentimentScore: feedback.sentimentScore,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
      deploymentId: feedback.deploymentId,
      userId: feedback.userId,
      categories: feedback.categories,
      creatorResponse: feedback.creatorResponse,
      responseDate: feedback.responseDate,
      metadata: feedback.metadata,
      user: {
        name: feedback.user?.name || null,
        image: feedback.user?.image || null,
        email: null
      }
    }))
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{deploymentWithMetrics.name}</h1>
            <p className="text-muted-foreground">{deploymentWithMetrics.description}</p>
          </div>
          <Badge variant={deploymentWithMetrics.status === 'active' ? 'success' : 'secondary'}>
            {deploymentWithMetrics.status}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{deploymentWithMetrics.metrics[0]?.totalRequests || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{deploymentWithMetrics.metrics[0]?.averageResponseTime || 0}ms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{deploymentWithMetrics.metrics[0]?.errorRate || 0}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{deploymentWithMetrics.metrics[0]?.successRate || 0}%</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="rounded-lg bg-muted p-4">
              {JSON.stringify(deploymentWithMetrics.health || {}, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deploymentWithMetrics.feedbacks.map((feedback) => (
                <div key={feedback.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {feedback.user?.image && (
                        <Image
                          src={feedback.user.image}
                          alt={feedback.user?.name || 'User'}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium">{feedback.user?.name || 'Anonymous'}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{feedback.rating}/5</Badge>
                  </div>
                  {feedback.comment && (
                    <p className="mt-2">{feedback.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 