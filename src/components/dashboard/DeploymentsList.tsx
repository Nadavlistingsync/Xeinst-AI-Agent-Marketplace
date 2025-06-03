import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeploymentStatus } from '@prisma/client';
import { Deployment as DeploymentType } from '@/types/deployment';

interface DeploymentsListProps {
  deployments: DeploymentType[];
  onDeploymentAction?: (id: string, action: 'start' | 'stop' | 'restart' | 'delete') => Promise<void>;
}

export function DeploymentsList({ deployments, onDeploymentAction }: DeploymentsListProps) {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleAction = async (id: string, action: 'start' | 'stop' | 'restart' | 'delete') => {
    if (!onDeploymentAction) return;
    
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      await onDeploymentAction(id, action);
    } catch (error) {
      console.error(`Failed to ${action} deployment:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const getStatusColor = (status: DeploymentStatus) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deployments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deployments.map((deployment) => (
            <div
              key={deployment.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <h3 className="font-medium">{deployment.name}</h3>
                  <p className="text-sm text-gray-500">{deployment.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(deployment.status)}`}>
                    {deployment.status}
                  </span>
                  {deployment.version && (
                    <span className="text-sm text-gray-500">v{deployment.version}</span>
                  )}
                </div>
              </div>
              {onDeploymentAction && (
                <div className="flex items-center space-x-2">
                  {deployment.status === 'stopped' && (
                    <button
                      onClick={() => handleAction(deployment.id, 'start')}
                      disabled={loading[deployment.id]}
                      className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      {loading[deployment.id] ? 'Starting...' : 'Start'}
                    </button>
                  )}
                  {deployment.status === 'active' && (
                    <button
                      onClick={() => handleAction(deployment.id, 'stop')}
                      disabled={loading[deployment.id]}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      {loading[deployment.id] ? 'Stopping...' : 'Stop'}
                    </button>
                  )}
                  {deployment.status === 'failed' && (
                    <button
                      onClick={() => handleAction(deployment.id, 'restart')}
                      disabled={loading[deployment.id]}
                      className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                    >
                      {loading[deployment.id] ? 'Restarting...' : 'Restart'}
                    </button>
                  )}
                  <button
                    onClick={() => handleAction(deployment.id, 'delete')}
                    disabled={loading[deployment.id]}
                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                  >
                    {loading[deployment.id] ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          ))}
          {deployments.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No deployments found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 