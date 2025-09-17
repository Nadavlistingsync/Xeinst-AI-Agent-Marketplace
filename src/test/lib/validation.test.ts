import { describe, it, expect } from 'vitest';
import { agentSchema, feedbackSchema, deploymentSchema, userSchema } from '../../lib/validation';

describe('Validation Schemas', () => {
  describe('agentSchema', () => {
    it('validates a valid agent', () => {
      const validAgent = {
        name: 'Test Agent',
        description: 'A test agent for validation',
        model_type: 'gpt-4',
        framework: 'langchain',
        price: 10.99,
        category: 'productivity',
        tags: ['ai', 'automation'],
        file_path: '/test/path',
      };

      const result = agentSchema.safeParse(validAgent);
      expect(result.success).toBe(true);
    });

    it('rejects agent without required fields', () => {
      const invalidAgent = {
        description: 'Missing name',
        price: 10.99,
      };

      const result = agentSchema.safeParse(invalidAgent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('name'))).toBe(true);
      }
    });

    it('rejects negative price', () => {
      const invalidAgent = {
        name: 'Test Agent',
        description: 'A test agent',
        model_type: 'gpt-4',
        framework: 'langchain',
        price: -10,
        category: 'productivity',
      };

      const result = agentSchema.safeParse(invalidAgent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('price'))).toBe(true);
      }
    });

    it('rejects invalid model type', () => {
      const invalidAgent = {
        name: 'Test Agent',
        description: 'A test agent',
        model_type: 'invalid-model',
        framework: 'langchain',
        price: 10.99,
        category: 'productivity',
      };

      const result = agentSchema.safeParse(invalidAgent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('model_type'))).toBe(true);
      }
    });

    it('rejects invalid category', () => {
      const invalidAgent = {
        name: 'Test Agent',
        description: 'A test agent',
        model_type: 'gpt-4',
        framework: 'langchain',
        price: 10.99,
        category: 'invalid-category',
      };

      const result = agentSchema.safeParse(invalidAgent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('category'))).toBe(true);
      }
    });
  });

  describe('feedbackSchema', () => {
    it('validates a valid feedback', () => {
      const validFeedback = {
        agent_id: 'agent-123',
        user_id: 'user-456',
        rating: 5,
        comment: 'Great agent!',
        category: 'performance',
        sentiment: 'positive',
      };

      const result = feedbackSchema.safeParse(validFeedback);
      expect(result.success).toBe(true);
    });

    it('rejects feedback without required fields', () => {
      const invalidFeedback = {
        rating: 5,
        comment: 'Great agent!',
      };

      const result = feedbackSchema.safeParse(invalidFeedback);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('agent_id'))).toBe(true);
        expect(result.error.issues.some(issue => issue.path.includes('user_id'))).toBe(true);
      }
    });

    it('rejects invalid rating', () => {
      const invalidFeedback = {
        agent_id: 'agent-123',
        user_id: 'user-456',
        rating: 6, // Should be 1-5
        comment: 'Great agent!',
      };

      const result = feedbackSchema.safeParse(invalidFeedback);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('rating'))).toBe(true);
      }
    });

    it('rejects invalid sentiment', () => {
      const invalidFeedback = {
        agent_id: 'agent-123',
        user_id: 'user-456',
        rating: 5,
        comment: 'Great agent!',
        sentiment: 'invalid-sentiment',
      };

      const result = feedbackSchema.safeParse(invalidFeedback);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('sentiment'))).toBe(true);
      }
    });
  });

  describe('deploymentSchema', () => {
    it('validates a valid deployment', () => {
      const validDeployment = {
        agent_id: 'agent-123',
        user_id: 'user-456',
        name: 'Test Deployment',
        description: 'A test deployment',
        status: 'active',
        environment: 'production',
        config: {
          max_concurrent_requests: 10,
          timeout: 30000,
        },
      };

      const result = deploymentSchema.safeParse(validDeployment);
      expect(result.success).toBe(true);
    });

    it('rejects deployment without required fields', () => {
      const invalidDeployment = {
        name: 'Test Deployment',
        status: 'active',
      };

      const result = deploymentSchema.safeParse(invalidDeployment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('agent_id'))).toBe(true);
        expect(result.error.issues.some(issue => issue.path.includes('user_id'))).toBe(true);
      }
    });

    it('rejects invalid status', () => {
      const invalidDeployment = {
        agent_id: 'agent-123',
        user_id: 'user-456',
        name: 'Test Deployment',
        status: 'invalid-status',
      };

      const result = deploymentSchema.safeParse(invalidDeployment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('status'))).toBe(true);
      }
    });

    it('rejects invalid environment', () => {
      const invalidDeployment = {
        agent_id: 'agent-123',
        user_id: 'user-456',
        name: 'Test Deployment',
        status: 'active',
        environment: 'invalid-environment',
      };

      const result = deploymentSchema.safeParse(invalidDeployment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('environment'))).toBe(true);
      }
    });
  });

  describe('userSchema', () => {
    it('validates a valid user', () => {
      const validUser = {
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        credits: 100,
      };

      const result = userSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('rejects user without required fields', () => {
      const invalidUser = {
        name: 'Test User',
        role: 'user',
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('email'))).toBe(true);
      }
    });

    it('rejects invalid email', () => {
      const invalidUser = {
        email: 'invalid-email',
        name: 'Test User',
        role: 'user',
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('email'))).toBe(true);
      }
    });

    it('rejects invalid role', () => {
      const invalidUser = {
        email: 'test@example.com',
        name: 'Test User',
        role: 'invalid-role',
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('role'))).toBe(true);
      }
    });

    it('rejects negative credits', () => {
      const invalidUser = {
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        credits: -10,
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('credits'))).toBe(true);
      }
    });
  });
}); 