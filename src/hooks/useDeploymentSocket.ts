'use client';

import { useEffect, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { DeploymentStatus } from '@/lib/websocket';

interface UseDeploymentSocketProps {
  deploymentId: string;
  enabled?: boolean;
}

interface UseDeploymentSocketReturn {
  status: DeploymentStatus | null;
  metrics: any | null;
  logs: any[];
  isConnected: boolean;
  error: Error | null;
}

export function useDeploymentSocket({
  deploymentId,
  enabled = true,
}: UseDeploymentSocketProps): UseDeploymentSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<DeploymentStatus | null>(null);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(() => {
    if (!enabled) return;

    const socketInstance = io({
      path: '/api/socket',
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      socketInstance.emit('join_deployment', deploymentId);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError(err);
    });

    socketInstance.on('deployment_status', (newStatus: DeploymentStatus) => {
      setStatus(newStatus);
    });

    socketInstance.on('deployment_metrics', (newMetrics: any) => {
      setMetrics(newMetrics);
    });

    socketInstance.on('deployment_log', (newLog: any) => {
      setLogs((prevLogs) => [newLog, ...prevLogs].slice(0, 100)); // Keep last 100 logs
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [deploymentId, enabled]);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      cleanup?.();
    };
  }, [connect]);

  useEffect(() => {
    if (socket && enabled) {
      socket.emit('join_deployment', deploymentId);
    }
    return () => {
      if (socket) {
        socket.emit('leave_deployment', deploymentId);
      }
    };
  }, [socket, deploymentId, enabled]);

  return {
    status,
    metrics,
    logs,
    isConnected,
    error,
  };
} 