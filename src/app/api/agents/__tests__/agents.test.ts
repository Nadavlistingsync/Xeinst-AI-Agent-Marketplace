import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getFeaturedAgents, getTrendingAgents } from '../route';
import { db } from '@/lib/db';
import { agents } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getAgentLogs, getAgentMetrics, logAgentEvent } from '@/lib/agent-monitoring';
import { agentLog, agentMetrics } from '@/lib/schema';
import { and } from 'drizzle-orm';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
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
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFeaturedAgents', () => {
    it('should return featured agents', async () => {
      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockAgents),
      };

      (db.select as jest.Mock).mockReturnValue(mockQuery);
      (db.from as jest.Mock).mockReturnValue(mockQuery);
      (db.where as jest.Mock).mockReturnValue(mockQuery);
      (db.orderBy as jest.Mock).mockReturnValue(mockQuery);

      const result = await getFeaturedAgents();
      expect(result).toEqual({ agents: mockAgents });
    });

    it('should handle database errors', async () => {
      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockRejectedValue(new Error('Database error')),
      };

      (db.select as jest.Mock).mockReturnValue(mockQuery);
      (db.from as jest.Mock).mockReturnValue(mockQuery);
      (db.where as jest.Mock).mockReturnValue(mockQuery);
      (db.orderBy as jest.Mock).mockReturnValue(mockQuery);

      await expect(getFeaturedAgents()).rejects.toThrow('Database error');
    });
  });

  describe('getTrendingAgents', () => {
    it('should return trending agents', async () => {
      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockAgents),
      };

      (db.select as jest.Mock).mockReturnValue(mockQuery);
      (db.from as jest.Mock).mockReturnValue(mockQuery);
      (db.where as jest.Mock).mockReturnValue(mockQuery);
      (db.orderBy as jest.Mock).mockReturnValue(mockQuery);

      const result = await getTrendingAgents();
      expect(result).toEqual({ agents: mockAgents });
    });

    it('should handle database errors', async () => {
      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockRejectedValue(new Error('Database error')),
      };

      (db.select as jest.Mock).mockReturnValue(mockQuery);
      (db.from as jest.Mock).mockReturnValue(mockQuery);
      (db.where as jest.Mock).mockReturnValue(mockQuery);
      (db.orderBy as jest.Mock).mockReturnValue(mockQuery);

      await expect(getTrendingAgents()).rejects.toThrow('Database error');
    });
  });
});

describe('Agent Monitoring', () => {
  const mockAgentId = 'test-agent-id';
  const mockDate = new Date('2024-01-01');

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

      (db.select as any).mockResolvedValue(mockLogs);

      const logs = await getAgentLogs(mockAgentId);

      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalledWith(agentLog);
      expect(db.where).toHaveBeenCalledWith(eq(agentLog.agentId, mockAgentId));
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

      (db.select as any).mockResolvedValue(mockLogs);

      const logs = await getAgentLogs(mockAgentId, {
        startDate: mockDate,
        endDate: new Date('2024-01-02'),
        level: 'error',
        limit: 10,
      });

      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalledWith(agentLog);
      expect(db.where).toHaveBeenCalledWith(and(
        eq(agentLog.agentId, mockAgentId),
        eq(agentLog.level, 'error')
      ));
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

      (db.select as any).mockResolvedValue([mockMetrics]);

      const metrics = await getAgentMetrics(mockAgentId);

      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalledWith(agentMetrics);
      expect(db.where).toHaveBeenCalledWith(eq(agentMetrics.agentId, mockAgentId));
      expect(metrics).toEqual(mockMetrics);
    });

    it('should return null when no metrics found', async () => {
      (db.select as any).mockResolvedValue([]);

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

      await logAgentEvent(mockAgentId, mockEvent.level, mockEvent.message, mockEvent.metadata);

      expect(db.insert).toHaveBeenCalledWith(agentLog);
      expect(db.values).toHaveBeenCalledWith(expect.objectContaining({
        agentId: mockAgentId,
        level: mockEvent.level,
        message: mockEvent.message,
        metadata: mockEvent.metadata,
      }));
    });
  });
}); 