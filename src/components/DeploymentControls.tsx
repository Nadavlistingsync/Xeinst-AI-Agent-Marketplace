import { useState } from 'react';
import { DeploymentStatus } from '@prisma/client';

interface DeploymentControlsProps {
  deploymentId: string;
  status: DeploymentStatus;
}

export function DeploymentControls({ deploymentId, status }: DeploymentControlsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/deployments/${deploymentId}/${action}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} deployment`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} deployment`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      {status === 'stopped' && (
        <button
          onClick={() => handleAction('start')}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Starting...' : 'Start'}
        </button>
      )}

      {status === 'active' && (
        <button
          onClick={() => handleAction('stop')}
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {isLoading ? 'Stopping...' : 'Stop'}
        </button>
      )}

      {status === 'failed' && (
        <button
          onClick={() => handleAction('restart')}
          disabled={isLoading}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
        >
          {isLoading ? 'Restarting...' : 'Restart'}
        </button>
      )}
    </div>
  );
} 