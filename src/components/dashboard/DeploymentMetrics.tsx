import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useDeploymentSocket } from '@/hooks/useDeploymentSocket';
import { Skeleton } from '@/components/ui/skeleton';

interface DeploymentMetricsProps {
  deploymentId: string;
}

export function DeploymentMetrics({ deploymentId }: DeploymentMetricsProps) {
  const { status, metrics, isConnected, error } = useDeploymentSocket({
    deploymentId,
  });

  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    if (metrics) {
      setHistoricalData((prev) => {
        const newData = [...prev, {
          timestamp: new Date().toISOString(),
          ...metrics,
        }].slice(-30); // Keep last 30 data points
        return newData;
      });
    }
  }, [metrics]);

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-500">Error loading metrics: {error.message}</div>
      </Card>
    );
  }

  if (!isConnected || !status) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </Card>
    );
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Deployment Metrics</h3>
          <Badge className={getHealthColor(status.health.status)}>
            {status.health.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-500">Error Rate</div>
            <div className="text-2xl font-semibold">
              {(status.health.metrics.errorRate * 100).toFixed(1)}%
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Response Time</div>
            <div className="text-2xl font-semibold">
              {status.health.metrics.responseTime.toFixed(0)}ms
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Success Rate</div>
            <div className="text-2xl font-semibold">
              {(status.health.metrics.successRate * 100).toFixed(1)}%
            </div>
          </Card>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleString()}
              />
              <Line
                type="monotone"
                dataKey="responseTime"
                stroke="#8884d8"
                name="Response Time (ms)"
              />
              <Line
                type="monotone"
                dataKey="errorRate"
                stroke="#ff7300"
                name="Error Rate"
              />
              <Line
                type="monotone"
                dataKey="successRate"
                stroke="#82ca9d"
                name="Success Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {status.health.issues.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Health Issues</h4>
            <ul className="space-y-1">
              {status.health.issues.map((issue, index) => (
                <li key={index} className="text-sm text-red-600">
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
} 