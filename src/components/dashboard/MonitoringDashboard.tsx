'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface AgentMetrics {
  requests: number;
  errors: number;
  avgResponseTime: number;
  lastActive: Date;
}

interface AgentLog {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

interface AgentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  issues: string[];
}

interface MonitoringDashboardProps {
  agentId: string;
}

export function MonitoringDashboard({ agentId }: MonitoringDashboardProps) {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [health, setHealth] = useState<AgentHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [agentId]);

  const fetchMonitoringData = async () => {
    try {
      const [metricsRes, logsRes, healthRes] = await Promise.all([
        fetch(`/api/agents/${agentId}/metrics`),
        fetch(`/api/agents/${agentId}/logs`),
        fetch(`/api/agents/${agentId}/health`),
      ]);

      if (!metricsRes.ok || !logsRes.ok || !healthRes.ok) {
        throw new Error('Failed to fetch monitoring data');
      }

      const [metricsData, logsData, healthData] = await Promise.all([
        metricsRes.json(),
        logsRes.json(),
        healthRes.json(),
      ]);

      setMetrics(metricsData);
      setLogs(logsData);
      setHealth(healthData);
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      toast.error('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading monitoring data...</div>;
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

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Health Status</h3>
          {health && (
            <div>
              <Badge className={`mb-2 ${getHealthColor(health.status)}`}>
                {health.status}
              </Badge>
              {health.issues.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {health.issues.map((issue, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          {metrics && (
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Total Requests:</span>
                <span className="ml-2 font-medium">{metrics.requests}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Error Rate:</span>
                <span className="ml-2 font-medium">
                  {((metrics.errors / metrics.requests) * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Avg Response Time:</span>
                <span className="ml-2 font-medium">
                  {metrics.avgResponseTime.toFixed(0)}ms
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Last Active:</span>
                <span className="ml-2 font-medium">
                  {new Date(metrics.lastActive).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = `/agent/${agentId}/edit`}
            >
              Edit Agent
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = `/agent/${agentId}/logs`}
            >
              View Full Logs
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Logs</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge className={getLogLevelColor(log.level)}>
                    {log.level}
                  </Badge>
                </TableCell>
                <TableCell>{log.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 