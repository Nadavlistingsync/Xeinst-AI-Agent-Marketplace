import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { DeploymentWithMetrics } from '@/types/deployment';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

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
      }
    }
  }) as DeploymentWithMetrics | null;

  if (!deployment) {
    notFound();
  }

  const metrics = await prisma.deploymentMetrics.findMany({
    where: { deploymentId: deployment.id },
    orderBy: { createdAt: 'desc' },
    take: 1
  });

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{deployment.name}</h1>
            <p className="text-muted-foreground">{deployment.description}</p>
          </div>
          <Badge variant={deployment.status === 'active' ? 'success' : 'secondary'}>
            {deployment.status}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{metrics[0]?.totalRequests || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{metrics[0]?.averageResponseTime || 0}ms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{metrics[0]?.errorRate || 0}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{metrics[0]?.successRate || 0}%</p>
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

        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deployment.feedbacks?.map((feedback) => (
                <div key={feedback.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {feedback.user.image && (
                        <img
                          src={feedback.user.image}
                          alt={feedback.user.name || 'User'}
                          className="h-8 w-8 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium">{feedback.user.name || 'Anonymous'}</p>
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