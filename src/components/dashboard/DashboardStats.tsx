import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityIcon, ClockIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";

interface DashboardStatsProps {
  userId?: string;
}

export const DashboardStats = async ({ userId }: DashboardStatsProps) => {
  const [totalRequests, averageResponseTime] = await Promise.all([
    prisma.deploymentMetrics.aggregate({
      _sum: {
        totalRequests: true
      },
      where: userId ? {
        deployment: {
          createdBy: userId
        }
      } : undefined
    }),
    prisma.deploymentMetrics.aggregate({
      _avg: {
        averageResponseTime: true
      },
      where: userId ? {
        deployment: {
          createdBy: userId
        }
      } : undefined
    })
  ]);

  const stats = [
    {
      title: "Total Requests",
      value: totalRequests._sum.totalRequests || 0,
      icon: ActivityIcon,
      description: "Total number of requests processed"
    },
    {
      title: "Average Response Time",
      value: `${(averageResponseTime._avg.averageResponseTime || 0).toFixed(2)}ms`,
      icon: ClockIcon,
      description: "Average time to process requests"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 