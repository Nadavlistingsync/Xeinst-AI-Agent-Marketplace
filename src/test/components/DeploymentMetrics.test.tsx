import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeploymentMetrics } from '@/components/DeploymentMetrics';
import { DeploymentStatusUpdate } from '@/types/websocket';

describe('DeploymentMetrics', () => {
  const mockMetrics: DeploymentStatusUpdate['metrics'] = {
    errorRate: 0.5,
    successRate: 99.5,
    activeUsers: 100,
    totalRequests: 1000,
    averageResponseTime: 200,
    requestsPerMinute: 50,
    averageTokensUsed: 150,
    costPerRequest: 0.01,
    totalCost: 10
  };

  it('renders metrics correctly', () => {
    render(<DeploymentMetrics metrics={mockMetrics} />);
    
    expect(screen.getByText('Error Rate')).toBeInTheDocument();
    expect(screen.getByText('0.50%')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('99.50%')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('handles undefined metrics', () => {
    render(<DeploymentMetrics metrics={undefined} />);
    expect(screen.queryByText('Error Rate')).not.toBeInTheDocument();
  });

  it('formats numbers correctly', () => {
    render(<DeploymentMetrics metrics={mockMetrics} />);
    
    expect(screen.getByText('$0.01')).toBeInTheDocument(); // cost per request
    expect(screen.getByText('$10.00')).toBeInTheDocument(); // total cost
    expect(screen.getByText('200')).toBeInTheDocument(); // average response time
  });

  it('displays all metric cards', () => {
    render(<DeploymentMetrics metrics={mockMetrics} />);
    
    const metricCards = [
      'Error Rate',
      'Success Rate',
      'Active Users',
      'Total Requests',
      'Avg Response Time',
      'Requests/Min',
      'Avg Tokens Used',
      'Cost/Request',
      'Total Cost'
    ];

    metricCards.forEach(card => {
      expect(screen.getByText(card)).toBeInTheDocument();
    });
  });
}); 