import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../route';
import { getAgentLogs, getAgentMetrics } from '@/lib/agent-monitoring';
import { prisma } from '@/lib/prisma';

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    agent: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    agentLog: {
      findMany: vi.fn(),
    },
    agentMetrics: {
      findMany: vi.fn(),
    },
  },
}));

describe('Agent API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array when no agents exist', async () => {
    const mockAgents: any[] = [];
    vi.mocked((prisma as any).agent.findMany).mockResolvedValue(mockAgents);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });

  it('should return agents when they exist', async () => {
    const mockAgents = [
      {
        id: '1',
        name: 'Test Agent',
        description: 'Test Description',
        model: 'gpt-4',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
      },
    ];
    vi.mocked((prisma as any).agent.findMany).mockResolvedValue(mockAgents);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockAgents.map(agent => ({
      ...agent,
      createdAt: agent.createdAt.toISOString(),
      updatedAt: agent.updatedAt.toISOString(),
    })));
  });

  it('should get agent logs', async () => {
    const mockLogs = [
      {
        id: '1',
        agentId: '1',
        level: 'info',
        message: 'Test log',
        timestamp: new Date(),
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        deploymentId: 'deploy-1',
      },
    ];
    vi.mocked((prisma as any).agentLog.findMany).mockResolvedValue(mockLogs);

    const logs = await getAgentLogs('1');
    expect(logs).toEqual(mockLogs.map(log => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
      updatedAt: log.updatedAt.toISOString(),
      timestamp: log.timestamp.toISOString(),
    })));
  });

  it('should get agent metrics', async () => {
    const mockMetrics = [
      {
        id: '1',
        agentId: '1',
        errorRate: 0.1,
        successRate: 0.9,
        totalRequests: 100,
        activeUsers: 10,
        averageResponseTime: 500,
        requestsPerMinute: 5,
        averageTokensUsed: 1000,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deploymentId: 'deploy-1',
        responseTime: 500,
        costPerRequest: 0.01,
        totalCost: 10,
        lastUpdated: new Date(),
      },
    ];
    vi.mocked((prisma as any).agentMetrics.findMany).mockResolvedValue(mockMetrics);

    const metrics = await getAgentMetrics('1');
    expect(metrics).toEqual(mockMetrics.map(metric => ({
      ...metric,
      createdAt: metric.createdAt.toISOString(),
      updatedAt: metric.updatedAt.toISOString(),
      timestamp: metric.timestamp.toISOString(),
      lastUpdated: metric.lastUpdated.toISOString(),
    })));
  });
}); 