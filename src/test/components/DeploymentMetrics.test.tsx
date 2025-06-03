import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DeploymentMetrics } from '@/components/dashboard/DeploymentMetrics';
import { useDeploymentSocket } from '@/hooks/useDeploymentSocket';

// Mock the useDeploymentSocket hook
vi.mock('@/hooks/useDeploymentSocket');

describe('DeploymentMetrics', () => {
  const mockDeploymentId = 'test-deployment';
  const mockStatus = {
    id: mockDeploymentId,
    status: 'active',
    health: {
      status: 'healthy',
      issues: [],
      metrics: {
        errorRate: 0.01,
        responseTime: 100,
        successRate: 0.99,
        totalRequests: 1000,
        activeUsers: 50,
      },
    },
    lastUpdated: new Date().toISOString(),
  };

  it('renders loading state when not connected', () => {
    (useDeploymentSocket as any).mockReturnValue({
      status: null,
      metrics: null,
      isConnected: false,
      error: null,
    });

    render(<DeploymentMetrics deploymentId={mockDeploymentId} socket={null} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders error state when there is an error', () => {
    const errorMessage = 'Failed to connect';
    (useDeploymentSocket as any).mockReturnValue({
      status: null,
      metrics: null,
      isConnected: false,
      error: new Error(errorMessage),
    });

    render(<DeploymentMetrics deploymentId={mockDeploymentId} socket={null} />);
    expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
  });

  it('renders metrics when connected and data is available', async () => {
    (useDeploymentSocket as any).mockReturnValue({
      status: mockStatus,
      metrics: mockStatus.health.metrics,
      isConnected: true,
      error: null,
    });

    render(<DeploymentMetrics deploymentId={mockDeploymentId} socket={null} />);

    await waitFor(() => {
      expect(screen.getByText('Deployment Metrics')).toBeInTheDocument();
      expect(screen.getByText('healthy')).toBeInTheDocument();
      expect(screen.getByText('1.0%')).toBeInTheDocument(); // Error Rate
      expect(screen.getByText('100ms')).toBeInTheDocument(); // Response Time
      expect(screen.getByText('99.0%')).toBeInTheDocument(); // Success Rate
    });
  });

  it('renders health issues when present', async () => {
    const statusWithIssues = {
      ...mockStatus,
      health: {
        ...mockStatus.health,
        status: 'degraded',
        issues: ['High response time', 'Low success rate'],
      },
    };

    (useDeploymentSocket as any).mockReturnValue({
      status: statusWithIssues,
      metrics: statusWithIssues.health.metrics,
      isConnected: true,
      error: null,
    });

    render(<DeploymentMetrics deploymentId={mockDeploymentId} socket={null} />);

    await waitFor(() => {
      expect(screen.getByText('Health Issues')).toBeInTheDocument();
      expect(screen.getByText('High response time')).toBeInTheDocument();
      expect(screen.getByText('Low success rate')).toBeInTheDocument();
    });
  });
}); 