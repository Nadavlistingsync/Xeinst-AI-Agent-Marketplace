import { useEffect, useState } from 'react';

interface Log {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

interface DeploymentLogsProps {
  deploymentId: string;
}

export function DeploymentLogs({ deploymentId }: DeploymentLogsProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`/api/deployments/${deploymentId}/logs`);
        if (!response.ok) {
          throw new Error('Failed to fetch logs');
        }
        const data = await response.json();
        setLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();

    // Set up WebSocket connection for real-time logs
    const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000');

    socket.onopen = () => {
      console.log('WebSocket connected for logs');
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'deployment_log' && message.payload.deploymentId === deploymentId) {
        setLogs(prevLogs => [...prevLogs, message.payload]);
      }
    };

    socket.onerror = (event) => {
      console.error('WebSocket error:', event);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      socket.close();
    };
  }, [deploymentId]);

  if (isLoading) {
    return <div>Loading logs...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return <div>No logs available</div>;
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div
          key={log.id}
          className={`p-3 rounded-lg ${
            log.level === 'error'
              ? 'bg-red-50 text-red-700'
              : log.level === 'warning'
              ? 'bg-yellow-50 text-yellow-700'
              : 'bg-gray-50 text-gray-700'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm">{log.message}</p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <p className="text-xs text-gray-500">
                {new Date(log.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 