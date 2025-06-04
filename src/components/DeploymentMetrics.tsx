import { DeploymentStatusUpdate } from '@/types/websocket';

interface DeploymentMetricsProps {
  metrics: DeploymentStatusUpdate['metrics'];
}

export function DeploymentMetrics({ metrics }: DeploymentMetricsProps) {
  if (!metrics) return null;

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return '0.00';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatPercentage = (num: number | undefined | null) => {
    if (num === undefined || num === null) return '0.00%';
    return `${formatNumber(num)}%`;
  };

  const formatCurrency = (num: number | undefined | null) => {
    if (num === undefined || num === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const metricCards = [
    {
      title: 'Error Rate',
      value: formatPercentage(metrics.errorRate),
      className: 'text-red-600'
    },
    {
      title: 'Success Rate',
      value: formatPercentage(metrics.successRate),
      className: 'text-green-600'
    },
    {
      title: 'Active Users',
      value: formatNumber(metrics.activeUsers)
    },
    {
      title: 'Total Requests',
      value: formatNumber(metrics.totalRequests)
    },
    {
      title: 'Avg Response Time',
      value: `${formatNumber(metrics.averageResponseTime)}ms`
    },
    {
      title: 'Requests/Min',
      value: formatNumber(metrics.requestsPerMinute)
    },
    {
      title: 'Avg Tokens Used',
      value: formatNumber(metrics.averageTokensUsed)
    },
    {
      title: 'Cost/Request',
      value: formatCurrency(metrics.costPerRequest)
    },
    {
      title: 'Total Cost',
      value: formatCurrency(metrics.totalCost)
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {metricCards.map((card) => (
        <div key={card.title} className="p-3 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
          <p className={`mt-1 text-lg font-semibold ${card.className || ''}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
} 