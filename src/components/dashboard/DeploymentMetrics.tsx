'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import type { DeploymentStatus } from '../../types/prisma';
import { AgentMetrics } from '../../types/agent-monitoring';

interface DeploymentMetricsProps {
  socket?: WebSocket | null;
  deploymentId?: string;
}

interface HealthMetrics {
  errorRate: number;
  responseTime: number;
  successRate: number;
  totalRequests: number;
  activeUsers: number;
}

interface HealthIssue {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

interface DeploymentHealth {
  status: DeploymentStatus;
  lastChecked: Date;
  metrics: HealthMetrics;
  issues: HealthIssue[];
}

interface DeploymentMetrics {
  health: DeploymentHealth;
  metrics: AgentMetrics;
}

export function DeploymentMetrics({ socket, deploymentId }: DeploymentMetricsProps) {
  const [historicalData, setHistoricalData] = useState<DeploymentMetrics[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket && !deploymentId) return;

    if (deploymentId) {
      // Fetch metrics from API
      const fetchMetrics = async () => {
        try {
          const response = await fetch(`/api/deployments/${deploymentId}/metrics`);
          if (!response.ok) throw new Error('Failed to fetch metrics');
          const data = await response.json();
          setHistoricalData(prev => [...prev, data].slice(-10));
          setConnectionStatus('connected');
          setError(null);
        } catch (err) {
          setError('Failed to fetch metrics');
          setConnectionStatus('disconnected');
        }
      };

      fetchMetrics();
      const interval = setInterval(fetchMetrics, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }

    // WebSocket handling
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as DeploymentMetrics;
        setHistoricalData(prev => [...prev, data].slice(-10));
        setConnectionStatus('connected');
        setError(null);
      } catch (err) {
        setError('Failed to parse metrics data');
        setConnectionStatus('disconnected');
      }
    };

    const handleError = () => {
      setError('WebSocket connection error');
      setConnectionStatus('disconnected');
    };

    const handleClose = () => {
      setConnectionStatus('disconnected');
    };

    socket?.addEventListener('message', handleMessage);
    socket?.addEventListener('error', handleError);
    socket?.addEventListener('close', handleClose);

    return () => {
      socket?.removeEventListener('message', handleMessage);
      socket?.removeEventListener('error', handleError);
      socket?.removeEventListener('close', handleClose);
    };
  }, [socket, deploymentId]);

  const getHealthColor = (status: DeploymentStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'deploying':
        return 'bg-yellow-500';
      case 'stopped':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const latestMetrics = historicalData[historicalData.length - 1];

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deployment Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!latestMetrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deployment Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500">No metrics available</div>
        </CardContent>
      </Card>
    );
  }

  const { health, metrics } = latestMetrics;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deployment Metrics</CardTitle>
        <div className="flex items-center gap-2">
          <Badge className={getHealthColor(health.status)}>
            {health.status}
          </Badge>
          <Badge variant="outline">
            {connectionStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium">Error Rate</h3>
            <p className="text-2xl font-bold">{(metrics.errorRate * 100).toFixed(1)}%</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Response Time</h3>
            <p className="text-2xl font-bold">{metrics.responseTime.toFixed(0)}ms</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Success Rate</h3>
            <p className="text-2xl font-bold">{(metrics.successRate * 100).toFixed(1)}%</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Active Users</h3>
            <p className="text-2xl font-bold">{metrics.activeUsers}</p>
          </div>
        </div>
        {health.issues.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Active Issues</h3>
            <div className="space-y-2">
              {health.issues.map((issue, index) => (
                <div key={index} className="text-sm text-red-500">
                  {issue.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 