import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getFeaturedAgents, getTrendingAgents } from '../route';
import { db } from '@/lib/db';
import { agents } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
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