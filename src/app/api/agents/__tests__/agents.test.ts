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
    agent: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
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
      created_at: new Date(),
      updated_at: new Date(),
      deployed_by: 'user1',
      status: 'active',
      category: 'test',
      is_featured: true,
      is_trending: true,
      usage_count: 0,
      rating: 4.5,
      price: 9.99,
      earnings_split: 0.7,
      deployment_count: 0,
      feedback_count: 0,
      total_earnings: 0,
      last_deployed: new Date(),
      last_used: new Date(),
      last_updated: new Date(),
      last_feedback: new Date(),
      last_rating: 4.5,
      last_earnings: 0,
      last_deployment: new Date(),
      last_usage: new Date(),
      last_feedback_date: new Date(),
      last_rating_date: new Date(),
      last_earnings_date: new Date(),
      last_deployment_date: new Date(),
      last_usage_date: new Date(),
      users: {
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
    // Clear the agents table before each test
    await testPrisma.agent.deleteMany();
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
    const testAgent = await testPrisma.agent.create({
      data: {
        name: 'Test Agent',
        description: 'Test Description',
        price: 100,
        rating: 4.5,
        imageUrl: '/test-image.jpg',
        user_id: 'user1',
        category: 'AI',
        status: 'active',
        is_featured: true,
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
      is_featured: testAgent.is_featured,
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
          agentId: mockAgentId,
          level: 'info',
          message: 'Test log',
          metadata: null,
          timestamp: mockDate,
          created_at: mockDate,
          updated_at: mockDate,
        },
      ];

      (prisma.agentLog.findMany as any).mockResolvedValue(mockLogs);

      const logs = await getAgentLogs(mockAgentId);

      expect(prisma.agentLog.findMany).toHaveBeenCalledWith({
        where: {
          agentId: mockAgentId,
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
          agentId: mockAgentId,
          level: 'error',
          message: 'Error log',
          metadata: { error: 'test error' },
          timestamp: mockDate,
          created_at: mockDate,
          updated_at: mockDate,
        },
      ];

      (prisma.agentLog.findMany as any).mockResolvedValue(mockLogs);

      const logs = await getAgentLogs(mockAgentId, {
        startDate: mockDate,
        endDate: new Date('2024-01-02'),
        level: 'error',
        limit: 10,
      });

      expect(prisma.agentLog.findMany).toHaveBeenCalledWith({
        where: {
          agentId: mockAgentId,
          level: 'error',
          timestamp: {
            gte: mockDate,
            lte: new Date('2024-01-02'),
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: 10,
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