import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { ActivityIcon, UsersIcon, ZapIcon, ClockIcon } from "lucide-react";

interface DashboardStatsProps {
  userId: string;
}

export default async function DashboardStats({ userId }: DashboardStatsProps) {
  const [totalRequests, averageResponseTime] = await Promise.all([
    prisma.deploymentMetrics.aggregate({
      where: {
        deployment: {
          deployedBy: userId
        }
      },
      _sum: {
        totalRequests: true
      }
    }),
    prisma.deploymentMetrics.aggregate({
      where: {
        deployment: {
          deployedBy: userId
        }
      },
      _avg: {
        averageResponseTime: true
      }
    })
  ]);

  const stats = [
    {
      title: 'Total Requests',
      value: totalRequests._sum?.totalRequests || 0,
      description: 'Total number of requests handled'
    },
    {
      title: 'Average Response Time',
      value: `${Math.round(averageResponseTime._avg?.averageResponseTime || 0)}ms`,
      description: 'Average time to process requests'
    },
    {
      title: 'Active Deployments',
      value: '0',
      description: 'Number of currently active deployments'
    },
    {
      title: 'Total Deployments',
      value: '0',
      description: 'Total number of deployments'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 