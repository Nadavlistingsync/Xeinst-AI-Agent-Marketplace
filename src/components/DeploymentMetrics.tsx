import { DeploymentStatusUpdate } from '@/types/websocket';

interface DeploymentMetricsProps {
  metrics: DeploymentStatusUpdate['metrics'];
}

export function DeploymentMetrics({ metrics }: DeploymentMetricsProps) {
  if (!metrics) return null;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatPercentage = (num: number) => {
    return `${formatNumber(num)}%`;
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div className="p-3 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500">Error Rate</h3>
        <p className="mt-1 text-lg font-semibold text-red-600">
          {formatPercentage(metrics.errorRate)}
        </p>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
        <p className="mt-1 text-lg font-semibold text-green-600">
          {formatPercentage(metrics.successRate)}
        </p>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
        <p className="mt-1 text-lg font-semibold">
          {formatNumber(metrics.activeUsers)}
        </p>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
        <p className="mt-1 text-lg font-semibold">
          {formatNumber(metrics.totalRequests)}
        </p>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500">Avg Response Time</h3>
        <p className="mt-1 text-lg font-semibold">
          {formatNumber(metrics.averageResponseTime)}ms
        </p>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500">Requests/Min</h3>
        <p className="mt-1 text-lg font-semibold">
          {formatNumber(metrics.requestsPerMinute)}
        </p>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500">Avg Tokens Used</h3>
        <p className="mt-1 text-lg font-semibold">
          {formatNumber(metrics.averageTokensUsed)}
        </p>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500">Cost/Request</h3>
        <p className="mt-1 text-lg font-semibold">
          {formatCurrency(metrics.costPerRequest)}
        </p>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-500">Total Cost</h3>
        <p className="mt-1 text-lg font-semibold">
          {formatCurrency(metrics.totalCost)}
        </p>
      </div>
    </div>
  );
} 