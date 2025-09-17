'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface AnalyticsData {
  period: string;
  startDate: string;
  endDate: string;
  summary: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    successRate: number;
    totalRevenue: number;
    averageExecutionTime: number;
  };
  charts: {
    executionsByDay: Array<{ date: string; count: number }>;
    topAgents: Array<{
      agentId: string;
      name: string;
      executions: number;
      averageTime: number;
      revenue: number;
    }>;
  };
  recentExecutions: Array<{
    id: string;
    agentName: string;
    userName: string;
    status: string;
    executionTime: number;
    createdAt: string;
    error?: string;
  }>;
  userAgents: Array<{ id: string; name: string }>;
}

const periodOptions = [
  { id: '1d', name: 'Last 24 Hours' },
  { id: '7d', name: 'Last 7 Days' },
  { id: '30d', name: 'Last 30 Days' },
  { id: '90d', name: 'Last 90 Days' }
];

export default function Analytics() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedAgent, setSelectedAgent] = useState('all');

  const fetchAnalytics = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedAgent !== 'all' && { agentId: selectedAgent })
      });

      const response = await fetch(`/api/analytics?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedAgent]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAnalytics();
    }
  }, [session, selectedPeriod, selectedAgent, fetchAnalytics]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Analytics Data</h1>
          <p className="text-gray-600 mb-6">Start using agents to see analytics.</p>
          <Link href="/marketplace">
            <Button>Browse Agents</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Track your agent performance and earnings</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Period:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              {periodOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Agent:</span>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Agents</option>
              {analytics.userAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.totalExecutions}</div>
              <p className="text-xs text-muted-foreground">
                {selectedPeriod} period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics.summary.successfulExecutions} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.summary.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                50% of execution fees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Execution Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.averageExecutionTime}ms</div>
              <p className="text-xs text-muted-foreground">
                Average response time
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Agents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Top Performing Agents
              </CardTitle>
              <CardDescription>
                Your most used agents this period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.charts.topAgents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No agent data available</p>
              ) : (
                <div className="space-y-4">
                  {analytics.charts.topAgents.map((agent, index) => (
                    <div key={agent.agentId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-sm text-gray-500">{agent.executions} executions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${agent.revenue.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{agent.averageTime}ms avg</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Executions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Executions
              </CardTitle>
              <CardDescription>
                Latest agent executions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.recentExecutions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent executions</p>
              ) : (
                <div className="space-y-3">
                  {analytics.recentExecutions.map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(execution.status)}
                        <div>
                          <p className="font-medium text-sm">{execution.agentName}</p>
                          <p className="text-xs text-gray-500">{execution.userName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(execution.status)}>
                          {execution.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {execution.executionTime}ms
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Executions Chart Placeholder */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Execution Trends</CardTitle>
            <CardDescription>
              Daily execution count over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Chart visualization would go here</p>
                <p className="text-sm text-gray-400">
                  {analytics.charts.executionsByDay.length} data points available
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
