import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma Client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    agentLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    agentMetrics: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    deployment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    $disconnect: vi.fn(),
  })),
}));

import { GET } from '../route';
import { prisma } from '@/test/setup';
import { getAgentLogs, getAgentMetrics } from '@/lib/agent-monitoring';

describe('Agents API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when no agents exist', async () => {
    // Mock Prisma to return empty array
    vi.mocked(prisma.deployment.findMany).mockResolvedValueOnce([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(0);
  });

  it('returns all agents when they exist', async () => {
    const mockAgent = {
      id: '1',
      name: 'Test Agent',
      description: 'Test Description',
      status: 'active',
      accessLevel: 'public',
      licenseType: 'free',
      environment: 'production',
      framework: 'node',
      modelType: 'standard',
      source: 'test-source',
      deployedBy: 'user1',
      createdBy: 'user1',
      rating: 4.5,
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock Prisma to return the test agent
    vi.mocked(prisma.deployment.findMany).mockResolvedValueOnce([mockAgent]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({
      id: mockAgent.id,
      name: mockAgent.name,
      description: mockAgent.description,
      status: mockAgent.status,
    });
  });
});

describe('Agent Monitoring', () => {
  const mockAgentId = 'test-agent-id';
  const mockDate = new Date('2024-01-01');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAgentLogs', () => {
    it('should fetch logs with default options', async () => {
      const mockLogs = [
        {
          id: '1',
          deploymentId: mockAgentId,
          level: 'info',
          message: 'Test log',
          metadata: null,
          timestamp: mockDate,
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      ];

      (prisma.agentLog.findMany as any).mockResolvedValue(mockLogs);

      const logs = await getAgentLogs(mockAgentId);

      expect(prisma.agentLog.findMany).toHaveBeenCalledWith({
        where: {
          deploymentId: mockAgentId,
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: 100
      });
      expect(logs).toEqual(mockLogs);
    });

    it('should fetch logs with custom options', async () => {
      const mockLogs = [
        {
          id: '1',
          deploymentId: mockAgentId,
          level: 'info',
          message: 'Test log',
          metadata: null,
          timestamp: mockDate,
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      ];

      (prisma.agentLog.findMany as any).mockResolvedValue(mockLogs);

      const logs = await getAgentLogs(mockAgentId, {
        startDate: mockDate,
        endDate: new Date('2024-01-02'),
        level: 'info',
        limit: 10
      });

      expect(prisma.agentLog.findMany).toHaveBeenCalledWith({
        where: {
          deploymentId: mockAgentId,
          timestamp: {
            gte: mockDate,
            lte: new Date('2024-01-02'),
          },
          level: 'info',
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: 10
      });
      expect(logs).toEqual(mockLogs);
    });
  });

  describe('getAgentMetrics', () => {
    it('should fetch metrics', async () => {
      const mockMetrics = {
        id: '1',
        deploymentId: mockAgentId,
        errorRate: 0.1,
        successRate: 0.9,
        activeUsers: 100,
        totalRequests: 1000,
        averageResponseTime: 200,
        requestsPerMinute: 10,
        averageTokensUsed: 100,
        costPerRequest: 0.01,
        totalCost: 10,
        createdAt: mockDate,
        updatedAt: mockDate
      };

      (prisma.agentMetrics.findUnique as any).mockResolvedValue(mockMetrics);

      const metrics = await getAgentMetrics(mockAgentId);

      expect(prisma.agentMetrics.findUnique).toHaveBeenCalledWith({
        where: { id: mockAgentId }
      });
      expect(metrics).toEqual(mockMetrics);
    });
  });
}); 