import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, POST } from '../../app/api/agents/route';
import { NextRequest } from 'next/server';
import { prisma } from '../setup';

// Mock environment variables
vi.mock('@/lib/auth', () => ({
  getServerSession: vi.fn(() => Promise.resolve({
    user: { id: 'test-user-id', email: 'test@example.com' }
  })),
  authOptions: {
    providers: [],
    session: { strategy: 'jwt' },
  },
}));

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(() => Promise.resolve({
    user: { id: 'test-user-id', email: 'test@example.com' }
  })),
}));

describe('Agents API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/agents', () => {
    it('returns list of agents successfully', async () => {
      const mockAgents = [
        {
          id: '1',
          name: 'Test Agent 1',
          description: 'Test description 1',
          model_type: 'gpt-4',
          framework: 'langchain',
          price: 10.99,
          download_count: 100,
          created_at: new Date(),
          file_path: '/test/path1',
          user_id: 'user1',
          status: 'active',
          version: '1.0.0',
          category: 'productivity',
          tags: ['ai', 'automation'],
          rating: 4.5,
          review_count: 10,
        },
        {
          id: '2',
          name: 'Test Agent 2',
          description: 'Test description 2',
          model_type: 'gpt-3.5',
          framework: 'openai',
          price: 5.99,
          download_count: 50,
          created_at: new Date(),
          file_path: '/test/path2',
          user_id: 'user2',
          status: 'active',
          version: '1.0.0',
          category: 'communication',
          tags: ['chat', 'support'],
          rating: 4.0,
          review_count: 5,
        }
      ];

      (prisma.agent.findMany as any).mockResolvedValue(mockAgents);

      const request = new NextRequest('http://localhost:3000/api/agents');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.agents).toHaveLength(5); // 3 example agents + 2 from database
      expect(data.agents[0].name).toBe('Text Summarizer');
      expect(data.agents[1].name).toBe('Image Classifier');
    });

    it('handles database errors gracefully', async () => {
      (prisma.agent.findMany as any).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/agents');
      
      // The API now returns a NextResponse.json instead of throwing
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to fetch agents');
    });

    it('filters agents by category', async () => {
      const mockAgents = [
        {
          id: '1',
          name: 'Productivity Agent',
          category: 'productivity',
          // ... other fields
        }
      ];

      (prisma.agent.findMany as any).mockResolvedValue(mockAgents);

      const request = new NextRequest('http://localhost:3000/api/agents?category=productivity');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.agents).toHaveLength(4); // 3 example agents + 1 filtered from database
      // Check that the database agent has the correct category
      const dbAgent = data.agents.find(agent => agent.name === 'Productivity Agent');
      expect(dbAgent?.category).toBe('productivity');
    });

    it('filters agents by price range', async () => {
      const mockAgents = [
        {
          id: '1',
          name: 'Cheap Agent',
          price: 5.99,
          // ... other fields
        }
      ];

      (prisma.agent.findMany as any).mockResolvedValue(mockAgents);

      const request = new NextRequest('http://localhost:3000/api/agents?minPrice=0&maxPrice=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.agents).toHaveLength(4); // 3 example agents + 1 filtered from database
      // Check that the database agent has the correct price
      const dbAgent = data.agents.find(agent => agent.name === 'Cheap Agent');
      expect(dbAgent?.price).toBe(5.99);
    });
  });

  describe('POST /api/agents', () => {
    it('creates a new agent successfully', async () => {
      const mockAgent = {
        id: 'new-agent-id',
        name: 'New Test Agent',
        description: 'New test description',
        model_type: 'gpt-4',
        framework: 'langchain',
        price: 15.99,
        download_count: 0,
        created_at: new Date(),
        file_path: '/new/test/path',
        user_id: 'test-user-id',
        status: 'active',
        version: '1.0.0',
        category: 'productivity',
        tags: ['new', 'ai'],
        rating: 0,
        review_count: 0,
      };

      (prisma.agent.create as any).mockResolvedValue(mockAgent);

      const agentData = {
        name: 'New Test Agent',
        description: 'New test description',
        model_type: 'gpt-4',
        framework: 'langchain',
        price: 15.99,
        category: 'productivity',
        tags: ['new', 'ai'],
        file_path: '/new/test/path',
      };

      const request = new NextRequest('http://localhost:3000/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.agent.name).toBe('New Test Agent');
      expect(data.agent.user_id).toBe('test-user-id');
    });

    it('validates required fields', async () => {
      const invalidAgentData = {
        description: 'Missing name',
        price: 15.99,
      };

      const request = new NextRequest('http://localhost:3000/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidAgentData),
      });

      // The API now returns a NextResponse.json instead of throwing
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Validation failed');
    });

    it('validates price is positive', async () => {
      const invalidAgentData = {
        name: 'Test Agent',
        description: 'Test description',
        category: 'productivity', // Add required category field
        price: -10,
        model_type: 'gpt-4',
        framework: 'langchain',
      };

      const request = new NextRequest('http://localhost:3000/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidAgentData),
      });

      // The API now returns a NextResponse.json instead of throwing
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Validation failed');
    });

    it('handles database errors during creation', async () => {
      (prisma.agent.create as any).mockRejectedValue(new Error('Database error'));

      const agentData = {
        name: 'Test Agent',
        description: 'Test description',
        model_type: 'gpt-4',
        framework: 'langchain',
        price: 15.99,
        category: 'productivity',
      };

      const request = new NextRequest('http://localhost:3000/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      // The enhanced error handling will throw an EnhancedAppError for database errors
      // The API now returns a NextResponse.json instead of throwing
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to create agent');
    });
  });
}); 