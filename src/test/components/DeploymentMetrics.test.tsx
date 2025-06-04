import { describe, it, expect, vi } from 'vitest';
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders metrics correctly', () => {
    render(<DeploymentMetrics metrics={mockMetrics} />);
    
    // Check all metric values are displayed correctly
    expect(screen.getByText('Error Rate')).toBeInTheDocument();
    expect(screen.getByText('0.50%')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('99.50%')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('100.00')).toBeInTheDocument();
    expect(screen.getByText('Total Requests')).toBeInTheDocument();
    expect(screen.getByText('1,000.00')).toBeInTheDocument();
    expect(screen.getByText('Avg Response Time')).toBeInTheDocument();
    expect(screen.getByText('200.00ms')).toBeInTheDocument();
    expect(screen.getByText('Requests/Min')).toBeInTheDocument();
    expect(screen.getByText('50.00')).toBeInTheDocument();
    expect(screen.getByText('Avg Tokens Used')).toBeInTheDocument();
    expect(screen.getByText('150.00')).toBeInTheDocument();
    expect(screen.getByText('Cost/Request')).toBeInTheDocument();
    expect(screen.getByText('$0.01')).toBeInTheDocument();
    expect(screen.getByText('Total Cost')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  it('handles undefined metrics', () => {
    render(<DeploymentMetrics metrics={undefined} />);
    
    // Check that no metrics are displayed
    expect(screen.queryByText('Error Rate')).not.toBeInTheDocument();
    expect(screen.queryByText('Success Rate')).not.toBeInTheDocument();
    expect(screen.queryByText('Active Users')).not.toBeInTheDocument();
    expect(screen.queryByText('Total Requests')).not.toBeInTheDocument();
    expect(screen.queryByText('Avg Response Time')).not.toBeInTheDocument();
    expect(screen.queryByText('Requests/Min')).not.toBeInTheDocument();
    expect(screen.queryByText('Avg Tokens Used')).not.toBeInTheDocument();
    expect(screen.queryByText('Cost/Request')).not.toBeInTheDocument();
    expect(screen.queryByText('Total Cost')).not.toBeInTheDocument();
  });

  it('handles partial metrics data with null values', () => {
    const partialMetrics = {
      errorRate: 1.5,
      successRate: 98.5,
      activeUsers: 50,
      totalRequests: null,
      averageResponseTime: undefined,
      requestsPerMinute: null,
      averageTokensUsed: undefined,
      costPerRequest: null,
      totalCost: undefined
    };

    render(<DeploymentMetrics metrics={partialMetrics as any} />);
    
    // Check that available metrics are displayed correctly
    expect(screen.getByText('Error Rate')).toBeInTheDocument();
    expect(screen.getByText('1.50%')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('98.50%')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('50.00')).toBeInTheDocument();
    
    // Check that null/undefined values are displayed as 0
    const totalRequestsSection = screen.getByText('Total Requests').closest('div');
    expect(totalRequestsSection).toHaveTextContent('0.00');

    const avgResponseTimeSection = screen.getByText('Avg Response Time').closest('div');
    expect(avgResponseTimeSection).toHaveTextContent('0.00ms');

    const requestsPerMinSection = screen.getByText('Requests/Min').closest('div');
    expect(requestsPerMinSection).toHaveTextContent('0.00');

    const avgTokensSection = screen.getByText('Avg Tokens Used').closest('div');
    expect(avgTokensSection).toHaveTextContent('0.00');

    const costPerRequestSection = screen.getByText('Cost/Request').closest('div');
    expect(costPerRequestSection).toHaveTextContent('$0.00');

    const totalCostSection = screen.getByText('Total Cost').closest('div');
    expect(totalCostSection).toHaveTextContent('$0.00');
  });
}); 