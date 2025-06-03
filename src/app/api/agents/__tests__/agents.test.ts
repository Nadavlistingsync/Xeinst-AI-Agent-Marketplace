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

import { getFeaturedAgents, getTrendingAgents, GET } from '../route';
import prisma from '@/lib/prisma';
import { getAgentLogs, getAgentMetrics, logAgentEvent } from '@/lib/agent-monitoring';
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
  const mockAgents = [
    {
      id: '1',
      name: 'Test Agent',
      description: 'Test Description',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user1',
      status: 'active',
      category: 'test',
      isFeatured: true,
      isTrending: true,
      usageCount: 0,
      rating: 4.5,
      price: 9.99,
      earningsSplit: 0.7,
      deploymentCount: 0,
      feedbackCount: 0,
      totalEarnings: 0,
      lastDeployed: new Date(),
      lastUsed: new Date(),
      lastUpdated: new Date(),
      lastFeedback: new Date(),
      lastRating: 4.5,
      lastEarnings: 0,
      lastDeployment: new Date(),
      lastUsage: new Date(),
      lastFeedbackDate: new Date(),
      lastRatingDate: new Date(),
      lastEarningsDate: new Date(),
      lastDeploymentDate: new Date(),
      lastUsageDate: new Date(),
      creator: {
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(async () => {
    // Clear the deployments table before each test
    await testPrisma.deployment.deleteMany();
  });

  describe('getFeaturedAgents', () => {
    it('should return featured agents', async () => {
      (prisma.deployment.findMany as any).mockResolvedValue(mockAgents);
      (prisma.deployment.count as any).mockResolvedValue(mockAgents.length);

      const result = await getFeaturedAgents();
      expect(result).toEqual({
        agents: mockAgents,
        pagination: {
          total: mockAgents.length,
          pages: 1,
          page: 1,
          limit: 10,
        },
      });
    });

    it('should handle database errors', async () => {
      (prisma.deployment.findMany as any).mockRejectedValue(new Error('Database error'));

      await expect(getFeaturedAgents()).rejects.toThrow('Database error');
    });
  });

  describe('getTrendingAgents', () => {
    it('should return trending agents', async () => {
      (prisma.deployment.findMany as any).mockResolvedValue(mockAgents);
      (prisma.deployment.count as any).mockResolvedValue(mockAgents.length);

      const result = await getTrendingAgents();
      expect(result).toEqual({
        agents: mockAgents,
        pagination: {
          total: mockAgents.length,
          pages: 1,
          page: 1,
          limit: 10,
        },
      });
    });

    it('should handle database errors', async () => {
      (prisma.deployment.findMany as any).mockRejectedValue(new Error('Database error'));

      await expect(getTrendingAgents()).rejects.toThrow('Database error');
    });
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
        price: 100,
        rating: 4.5,
        imageUrl: '/test-image.jpg',
        createdBy: 'user1',
        category: 'AI',
        status: 'active',
        isFeatured: true,
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
      price: testAgent.price,
      rating: testAgent.rating,
      imageUrl: testAgent.imageUrl,
      category: testAgent.category,
      status: testAgent.status,
      isFeatured: testAgent.isFeatured,
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
          level: 'error',
          message: 'Test error log',
          metadata: null,
          timestamp: mockDate,
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      ];

      (prisma.agentLog.findMany as any).mockResolvedValue(mockLogs);

      const logs = await getAgentLogs(mockAgentId, {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-02'),
        level: 'error',
      });

      expect(prisma.agentLog.findMany).toHaveBeenCalledWith({
        where: {
          deploymentId: mockAgentId,
          timestamp: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-02'),
          },
          level: 'error',
        },
        orderBy: {
          timestamp: 'desc',
        },
      });
      expect(logs).toEqual(mockLogs);
    });
  });

  describe('getAgentMetrics', () => {
    it('should fetch agent metrics', async () => {
      const mockMetrics = {
        id: '1',
        agentId: mockAgentId,
        requests: 100,
        errors: 5,
        avgResponseTime: '50.5',
        lastActive: mockDate,
        created_at: mockDate,
        updated_at: mockDate,
      };

      (prisma.agentMetrics.findUnique as any).mockResolvedValue(mockMetrics);

      const metrics = await getAgentMetrics(mockAgentId);

      expect(prisma.agentMetrics.findUnique).toHaveBeenCalledWith({
        where: {
          agentId: mockAgentId,
        },
      });
      expect(metrics).toEqual(mockMetrics);
    });

    it('should return null when no metrics found', async () => {
      (prisma.agentMetrics.findUnique as any).mockResolvedValue(null);

      const metrics = await getAgentMetrics(mockAgentId);

      expect(metrics).toBeNull();
    });
  });

  describe('logAgentEvent', () => {
    it('should log an agent event', async () => {
      const mockEvent = {
        level: 'info' as const,
        message: 'Test event',
        metadata: { test: 'data' },
      };

      const mockCreatedLog = {
        id: expect.any(String),
        agentId: mockAgentId,
        level: mockEvent.level,
        message: mockEvent.message,
        metadata: mockEvent.metadata,
        timestamp: expect.any(Date),
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      };

      (prisma.agentLog.create as any).mockResolvedValue(mockCreatedLog);

      await logAgentEvent(mockAgentId, mockEvent.level, mockEvent.message, mockEvent.metadata);

      expect(prisma.agentLog.create).toHaveBeenCalledWith({
        data: {
          agentId: mockAgentId,
          level: mockEvent.level,
          message: mockEvent.message,
          metadata: mockEvent.metadata,
          timestamp: expect.any(Date),
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        },
      });
    });

    it('should handle database errors', async () => {
      const mockEvent = {
        level: 'info' as const,
        message: 'Test event',
        metadata: { test: 'data' },
      };

      (prisma.agentLog.create as any).mockRejectedValue(new Error('Database error'));

      await expect(
        logAgentEvent(mockAgentId, mockEvent.level, mockEvent.message, mockEvent.metadata)
      ).rejects.toThrow('Database error');
    });
  });
}); 