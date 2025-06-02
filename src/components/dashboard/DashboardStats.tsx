import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { ActivityIcon, UsersIcon, ZapIcon, ClockIcon } from "lucide-react";

interface DashboardStatsProps {
  userId: string;
}

export async function DashboardStats({ userId }: DashboardStatsProps) {
  const [
    totalDeployments,
    activeDeployments,
    totalRequests,
    averageResponseTime,
  ] = await Promise.all([
    prisma.deployment.count({
      where: { deployedBy: userId },
    }),
    prisma.deployment.count({
      where: {
        deployedBy: userId,
        status: "active",
      },
    }),
    prisma.agentMetrics.aggregate({
      where: {
        agent: {
          deployedBy: userId,
        },
      },
      _sum: {
        totalRequests: true,
      },
    }),
    prisma.agentMetrics.aggregate({
      where: {
        agent: {
          deployedBy: userId,
        },
      },
      _avg: {
        averageResponseTime: true,
      },
    }),
  ]);

  const stats = [
    {
      title: "Total Deployments",
      value: totalDeployments,
      icon: ActivityIcon,
      description: "Total number of deployed agents",
    },
    {
      title: "Active Deployments",
      value: activeDeployments,
      icon: ZapIcon,
      description: "Currently active agents",
    },
    {
      title: "Total Requests",
      value: totalRequests._sum.totalRequests || 0,
      icon: UsersIcon,
      description: "Total requests processed",
    },
    {
      title: "Avg Response Time",
      value: `${Math.round(averageResponseTime._avg.averageResponseTime || 0)}ms`,
      icon: ClockIcon,
      description: "Average response time",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-gray-500">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 