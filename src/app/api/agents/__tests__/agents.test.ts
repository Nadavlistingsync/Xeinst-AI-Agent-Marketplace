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
      findFirst: vi.fn(),
    },
  },
}));

describe('Agent API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return demo agents when no agents exist', async () => {
    // Mock empty response
    (prisma.agent.findMany as any).mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    // The API returns 3 demo agents if the DB is empty
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(3);
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('description');
  });

  it('should return agents when they exist', async () => {
    const mockAgents = [
      {
        id: '1',
        name: 'Test Agent',
        description: 'Test Description',
        createdAt: new Date('2025-06-28T18:07:53.271Z'),
        updatedAt: new Date('2025-06-28T18:07:53.271Z'),
        status: 'active',
        model: 'gpt-4',
        metadata: {},
      },
    ];

    // Mock agent response
    (prisma.agent.findMany as any).mockResolvedValue(mockAgents);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].id).toBe('1');
    expect(data[0].name).toBe('Test Agent');
    expect(data[0].description).toBe('Test Description');
  });

  it('should get agent logs', async () => {
    const mockLogs = [
      {
        id: '1',
        agentId: '1',
        deploymentId: 'deploy-1',
        level: 'info',
        message: 'Test log',
        metadata: {},
        timestamp: new Date('2025-06-28T18:07:53.576Z'),
        createdAt: new Date('2025-06-28T18:07:53.576Z'),
        updatedAt: new Date('2025-06-28T18:07:53.576Z'),
      },
    ];

    // Mock logs response
    (prisma.agentLog.findMany as any).mockResolvedValue(mockLogs);

    const logs = await getAgentLogs('1');
    expect(Array.isArray(logs)).toBe(true);
    expect(logs[0].id).toBe('1');
    expect(typeof logs[0].createdAt === 'string' || logs[0].createdAt instanceof Date).toBe(true);
  });

  it('should get agent metrics', async () => {
    const mockMetrics = {
      id: '1',
      deploymentId: '1',
      errorRate: 0.5,
      successRate: 99.5,
      activeUsers: 100,
      totalRequests: 1000,
      averageResponseTime: 200,
      requestsPerMinute: 50,
      averageTokensUsed: 150,
      costPerRequest: 0.01,
      totalCost: 10,
      responseTime: 200,
      lastUpdated: new Date('2025-06-28T18:07:53.576Z'),
      timestamp: new Date('2025-06-28T18:07:53.576Z'),
    };

    // Mock metrics response
    (prisma.agentMetrics.findFirst as any).mockResolvedValue(mockMetrics);

    const metrics = await getAgentMetrics('1');
    expect(metrics).not.toBeNull();
    if (metrics) {
      expect(metrics).toHaveProperty('id', '1');
      expect(metrics).toHaveProperty('deploymentId', '1');
      expect(typeof metrics.lastUpdated === 'string' || metrics.lastUpdated instanceof Date).toBe(true);
      expect(typeof metrics.timestamp === 'string' || metrics.timestamp instanceof Date).toBe(true);
    }
  });
}); 