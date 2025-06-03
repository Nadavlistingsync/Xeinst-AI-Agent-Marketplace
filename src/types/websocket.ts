import { DeploymentStatus } from '@prisma/client';

export interface DeploymentMetrics {
  errorRate: number;
  successRate: number;
  activeUsers: number;
  totalRequests: number;
  averageResponseTime: number;
  requestsPerMinute: number;
  averageTokensUsed: number;
  costPerRequest: number;
  totalCost: number;
}

export interface DeploymentStatusUpdate {
  id: string;
  status: DeploymentStatus;
  metrics?: {
    errorRate: number;
    successRate: number;
    activeUsers: number;
    totalRequests: number;
    averageResponseTime: number;
    requestsPerMinute: number;
    averageTokensUsed: number;
    costPerRequest: number;
    totalCost: number;
  };
  lastUpdated: string;
}

export interface WebSocketMessage {
  type: 'deployment_status' | 'error' | 'info';
  payload: DeploymentStatusUpdate | string;
}

export interface WebSocketConnection {
  id: string;
  userId: string;
  deploymentId: string;
  status: 'connected' | 'disconnected';
  lastActivity: Date;
}

export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: Date;
}

export interface WebSocketMetrics {
  totalConnections: number;
  activeConnections: number;
  messagesSent: number;
  messagesReceived: number;
  averageLatency: number;
  errorRate: number;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
}

export interface WebSocketClient {
  id: string;
  deploymentId?: string;
  lastPing: number;
  isConnected: boolean;
}

export interface WebSocketServer {
  clients: Map<string, WebSocketClient>;
  broadcast: (message: WebSocketMessage) => void;
  sendToClient: (clientId: string, message: WebSocketMessage) => void;
} 