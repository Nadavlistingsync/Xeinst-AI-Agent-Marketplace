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
    },
    agentLog: {
      findMany: vi.fn(),
    },
    agentMetrics: {
      findFirst: vi.fn(),
    },
  },
}));

describe('Agent API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array when no agents exist', async () => {
    vi.mocked(prisma.agent.findMany).mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });

  it('should return agents when they exist', async () => {
    const now = new Date();
    const mockAgents = [
      {
        id: '1',
        name: 'Test Agent',
        description: 'Test Description',
        capabilities: ['test'],
        createdAt: now,
        updatedAt: now,
      },
    ];

    vi.mocked(prisma.agent.findMany).mockResolvedValue(mockAgents);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([
      {
        ...mockAgents[0],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ]);
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
      },
    ];

    vi.mocked(prisma.agentLog.findMany).mockResolvedValue(mockLogs);

    const logs = await getAgentLogs('1');
    expect(logs).toEqual(mockLogs);
  });

  it('should get agent metrics', async () => {
    const mockMetrics = {
      id: '1',
      agentId: '1',
      errorRate: 0.1,
      successRate: 0.9,
      totalRequests: 100,
      activeUsers: 10,
      averageResponseTime: 200,
      requestsPerMinute: 5,
      averageTokensUsed: 100,
      costPerRequest: 0.01,
      totalCost: 1.0,
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUpdated: new Date(),
    };

    vi.mocked(prisma.agentMetrics.findFirst).mockResolvedValue(mockMetrics);

    const metrics = await getAgentMetrics('1');
    expect(metrics).toEqual(mockMetrics);
  });
}); 