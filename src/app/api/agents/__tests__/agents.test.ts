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
import prisma from '@/lib/prisma';
import { getAgentLogs, getAgentMetrics } from '@/lib/agent-monitoring';
import { prisma as testPrisma } from '@/test/setup';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    deployment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    },
    agentLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    agentMetrics: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe('Agents API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(async () => {
    // Clear the deployments table before each test
    await testPrisma.deployment.deleteMany();
  });

  it('returns empty array when no agents exist', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(0);
  });

  it('returns all agents when they exist', async () => {
    // Create a test agent
    const testAgent = await testPrisma.deployment.create({
      data: {
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
      },
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({
      id: testAgent.id,
      name: testAgent.name,
      description: testAgent.description,
      status: testAgent.status,
      accessLevel: testAgent.accessLevel,
      licenseType: testAgent.licenseType,
      environment: testAgent.environment,
      framework: testAgent.framework,
      modelType: testAgent.modelType,
      source: testAgent.source,
      deployedBy: testAgent.deployedBy,
      createdBy: testAgent.createdBy,
      rating: testAgent.rating,
      version: testAgent.version,
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