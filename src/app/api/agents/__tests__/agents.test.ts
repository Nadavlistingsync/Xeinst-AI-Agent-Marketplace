import { GET as getFeatured } from '../featured/route';
import { GET as getTrending } from '../trending/route';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
  } as unknown as typeof db,
}));

describe('Agents API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Featured Agents', () => {
    it('returns empty array when no featured agents found', async () => {
      const response = await getFeatured();
      const data = await response.json();

      expect(response).toBeInstanceOf(Object);
      expect(response.status).toBe(200);
      expect(data).toEqual({
        agents: [],
        message: 'No featured agents found',
      });
    });

    it('returns featured agents when found', async () => {
      const mockAgents = [
        {
          id: '1',
          name: 'Test Agent',
          description: 'Test Description',
          tag: 'Test Tag',
          price: 10,
          image_url: 'test.jpg',
          average_rating: 4.5,
          total_ratings: 100,
          download_count: 1000,
          is_public: true,
          is_featured: true,
          created_at: new Date(),
        },
      ];

      (db.limit as jest.Mock).mockResolvedValueOnce(mockAgents);

      const response = await getFeatured();
      const data = await response.json();

      expect(response).toBeInstanceOf(Object);
      expect(response.status).toBe(200);
      expect(data.agents).toHaveLength(1);
      expect(data.count).toBe(1);
      expect(data.timestamp).toBeDefined();
    });

    it('handles database connection errors', async () => {
      (db.limit as jest.Mock).mockRejectedValueOnce(new Error('connection error'));

      const response = await getFeatured();
      const data = await response.json();

      expect(response).toBeInstanceOf(Object);
      expect(response.status).toBe(503);
      expect(data.error).toBe('Database connection error');
    });
  });

  describe('Trending Agents', () => {
    it('returns empty array when no trending agents found', async () => {
      const response = await getTrending();
      const data = await response.json();

      expect(response).toBeInstanceOf(Object);
      expect(response.status).toBe(200);
      expect(data).toEqual({
        agents: [],
        message: 'No trending agents found',
      });
    });

    it('returns trending agents when found', async () => {
      const mockAgents = [
        {
          id: '1',
          name: 'Test Agent',
          description: 'Test Description',
          tag: 'Test Tag',
          price: 10,
          image_url: 'test.jpg',
          average_rating: 4.5,
          total_ratings: 100,
          download_count: 1000,
          is_public: true,
          is_featured: false,
          created_at: new Date(),
        },
      ];

      (db.limit as jest.Mock).mockResolvedValueOnce(mockAgents);

      const response = await getTrending();
      const data = await response.json();

      expect(response).toBeInstanceOf(Object);
      expect(response.status).toBe(200);
      expect(data.agents).toHaveLength(1);
      expect(data.count).toBe(1);
      expect(data.timestamp).toBeDefined();
    });

    it('handles database connection errors', async () => {
      (db.limit as jest.Mock).mockRejectedValueOnce(new Error('connection error'));

      const response = await getTrending();
      const data = await response.json();

      expect(response).toBeInstanceOf(Object);
      expect(response.status).toBe(503);
      expect(data.error).toBe('Database connection error');
    });
  });
}); 