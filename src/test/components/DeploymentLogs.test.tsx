import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DeploymentLogs } from "../../components/dashboard/DeploymentLogs";
import { useDeploymentSocket } from '../../hooks/useDeploymentSocket';

// Mock the useDeploymentSocket hook
vi.mock('@/hooks/useDeploymentSocket');

describe('DeploymentLogs', () => {
  const mockDeploymentId = 'test-deployment';
  const mockLogs = [
    {
      level: 'info',
      message: 'Deployment started',
      timestamp: new Date().toISOString(),
      metadata: { version: '1.0.0' },
    },
    {
      level: 'warning',
      message: 'High memory usage detected',
      timestamp: new Date().toISOString(),
      metadata: { memoryUsage: '85%' },
    },
    {
      level: 'error',
      message: 'Failed to process request',
      timestamp: new Date().toISOString(),
      metadata: { requestId: '123', error: 'Timeout' },
    },
  ];

  it('renders loading state when not connected', () => {
    (useDeploymentSocket as any).mockReturnValue({
      logs: [],
      isConnected: false,
      error: null,
    });

    render(<DeploymentLogs deploymentId={mockDeploymentId} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders error state when there is an error', () => {
    const errorMessage = 'Failed to connect';
    (useDeploymentSocket as any).mockReturnValue({
      logs: [],
      isConnected: false,
      error: new Error(errorMessage),
    });

    render(<DeploymentLogs deploymentId={mockDeploymentId} />);
    expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
  });

  it('renders logs when connected and data is available', async () => {
    (useDeploymentSocket as any).mockReturnValue({
      logs: mockLogs,
      isConnected: true,
      error: null,
    });

    render(<DeploymentLogs deploymentId={mockDeploymentId} />);

    await waitFor(() => {
      expect(screen.getByText('Deployment Logs')).toBeInTheDocument();
      expect(screen.getByText('3 logs')).toBeInTheDocument();
      expect(screen.getByText('Deployment started')).toBeInTheDocument();
      expect(screen.getByText('High memory usage detected')).toBeInTheDocument();
      expect(screen.getByText('Failed to process request')).toBeInTheDocument();
    });
  });

  it('renders empty state when no logs are available', async () => {
    (useDeploymentSocket as any).mockReturnValue({
      logs: [],
      isConnected: true,
      error: null,
    });

    render(<DeploymentLogs deploymentId={mockDeploymentId} />);

    await waitFor(() => {
      expect(screen.getByText('No logs available')).toBeInTheDocument();
    });
  });

  it('renders log metadata when available', async () => {
    (useDeploymentSocket as any).mockReturnValue({
      logs: mockLogs,
      isConnected: true,
      error: null,
    });

    render(<DeploymentLogs deploymentId={mockDeploymentId} />);

    await waitFor(() => {
      expect(screen.getByText(/"version": "1.0.0"/)).toBeInTheDocument();
      expect(screen.getByText(/"memoryUsage": "85%"/)).toBeInTheDocument();
      expect(screen.getByText(/"requestId": "123"/)).toBeInTheDocument();
    });
  });

  it('applies correct color classes to log levels', async () => {
    (useDeploymentSocket as any).mockReturnValue({
      logs: mockLogs,
      isConnected: true,
      error: null,
    });

    render(<DeploymentLogs deploymentId={mockDeploymentId} />);

    await waitFor(() => {
      const infoBadge = screen.getByText('info');
      const warningBadge = screen.getByText('warning');
      const errorBadge = screen.getByText('error');

      expect(infoBadge).toHaveClass('bg-blue-100', 'text-blue-800');
      expect(warningBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
      expect(errorBadge).toHaveClass('bg-red-100', 'text-red-800');
    });
  });
}); 