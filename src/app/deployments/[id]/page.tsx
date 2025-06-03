import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DeploymentStatus } from '@prisma/client';
import type { DeploymentStatusUpdate } from '@/types/websocket';
import { DeploymentMetrics } from '@/components/DeploymentMetrics';
import { DeploymentLogs } from '@/components/DeploymentLogs';
import { DeploymentControls } from '@/components/DeploymentControls';

export default function DeploymentPage() {
  const { id } = useParams();
  const [status, setStatus] = useState<DeploymentStatusUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000');

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'deployment_status') {
        setStatus(message.payload);
      } else if (message.type === 'error') {
        setError(message.payload);
      }
    };

    socket.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError('Failed to connect to deployment status updates');
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      socket.close();
    };
  }, [id]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <h2 className="text-lg font-semibold">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="p-4">
        <p>Loading deployment status...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Deployment {id}</h1>
        <DeploymentControls deploymentId={id as string} status={status.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Status</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Current Status:</span>{' '}
              <span className={`px-2 py-1 rounded text-sm ${
                status.status === 'active' ? 'bg-green-100 text-green-800' :
                status.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {status.status}
              </span>
            </p>
            <p>
              <span className="font-medium">Last Updated:</span>{' '}
              {new Date(status.lastUpdated).toLocaleString()}
            </p>
          </div>
        </div>

        {status.metrics && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Metrics</h2>
            <DeploymentMetrics metrics={status.metrics} />
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Logs</h2>
        <DeploymentLogs deploymentId={id as string} />
      </div>
    </div>
  );
} 