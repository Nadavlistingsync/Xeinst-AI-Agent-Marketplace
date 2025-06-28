import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { withApiPerformanceTracking } from './performance';

// Base schemas for common patterns
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long');
export const urlSchema = z.string().url('Invalid URL');
export const uuidSchema = z.string().uuid('Invalid UUID');

// User-related schemas
export const userCreateSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  company: z.string().max(100, 'Company name too long').optional(),
  role: z.enum(['user', 'admin']).default('user')
});

export const userUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  company: z.string().max(100, 'Company name too long').optional(),
  avatar: urlSchema.optional(),
  preferences: z.record(z.any()).optional()
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

// Agent-related schemas
export const agentCreateSchema = z.object({
  name: z.string().min(1, 'Agent name is required').max(100, 'Agent name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
  price: z.number().min(0, 'Price cannot be negative').max(10000, 'Price too high'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Invalid version format (use x.y.z)'),
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  framework: z.string().min(1, 'Framework is required').max(50, 'Framework too long'),
  modelType: z.string().min(1, 'Model type is required').max(50, 'Model type too long'),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string().max(30)).max(10, 'Too many tags').optional(),
  configuration: z.record(z.any()).optional()
});

export const agentUpdateSchema = z.object({
  name: z.string().min(1, 'Agent name is required').max(100, 'Agent name too long').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long').optional(),
  category: z.string().min(1, 'Category is required').max(50, 'Category too long').optional(),
  price: z.number().min(0, 'Price cannot be negative').max(10000, 'Price too high').optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Invalid version format (use x.y.z)').optional(),
  environment: z.enum(['development', 'staging', 'production']).optional(),
  framework: z.string().min(1, 'Framework is required').max(50, 'Framework too long').optional(),
  modelType: z.string().min(1, 'Model type is required').max(50, 'Model type too long').optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string().max(30)).max(10, 'Too many tags').optional(),
  configuration: z.record(z.any()).optional()
});

export const agentDeploySchema = z.object({
  agentId: uuidSchema,
  deploymentConfig: z.object({
    environment: z.enum(['development', 'staging', 'production']).default('production'),
    resources: z.object({
      cpu: z.number().min(0.1).max(4).default(0.5),
      memory: z.number().min(128).max(8192).default(512),
      storage: z.number().min(1).max(100).default(10)
    }).optional(),
    scaling: z.object({
      minReplicas: z.number().min(1).max(10).default(1),
      maxReplicas: z.number().min(1).max(20).default(3),
      targetCPUUtilization: z.number().min(50).max(90).default(70)
    }).optional()
  }).optional()
});

// Deployment-related schemas
export const deploymentCreateSchema = z.object({
  agentId: uuidSchema,
  name: z.string().min(1, 'Deployment name is required').max(100, 'Deployment name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  environment: z.enum(['development', 'staging', 'production']).default('production'),
  configuration: z.record(z.any()).optional()
});

export const deploymentUpdateSchema = z.object({
  name: z.string().min(1, 'Deployment name is required').max(100, 'Deployment name too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
  environment: z.enum(['development', 'staging', 'production']).optional(),
  configuration: z.record(z.any()).optional()
});

// Feedback-related schemas
export const feedbackCreateSchema = z.object({
  agentId: uuidSchema,
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(1, 'Comment is required').max(1000, 'Comment too long'),
  category: z.enum(['bug', 'feature', 'general', 'performance']).default('general'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  metadata: z.record(z.any()).optional()
});

export const feedbackUpdateSchema = z.object({
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5').optional(),
  comment: z.string().min(1, 'Comment is required').max(1000, 'Comment too long').optional(),
  category: z.enum(['bug', 'feature', 'general', 'performance']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  metadata: z.record(z.any()).optional()
});

// File upload schemas
export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required').max(255, 'Filename too long'),
  contentType: z.string().min(1, 'Content type is required').max(100, 'Content type too long'),
  size: z.number().min(1, 'File size must be greater than 0').max(100 * 1024 * 1024, 'File too large (max 100MB)'),
  metadata: z.record(z.any()).optional()
});

// Payment and subscription schemas
export const paymentCreateSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.enum(['usd', 'eur', 'gbp']).default('usd'),
  description: z.string().min(1, 'Description is required').max(255, 'Description too long'),
  metadata: z.record(z.any()).optional()
});

export const subscriptionCreateSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  interval: z.enum(['monthly', 'yearly']).default('monthly'),
  metadata: z.record(z.any()).optional()
});

// Search and filter schemas
export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
  category: z.string().max(50).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  rating: z.number().min(1).max(5).optional(),
  sortBy: z.enum(['name', 'price', 'rating', 'createdAt', 'downloads']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
});

// API response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.string().datetime().optional()
});

// Validation error response
export const validationErrorResponse = (errors: z.ZodError) => {
  return NextResponse.json({
    success: false,
    error: 'Validation Error',
    message: 'Invalid input data',
    details: errors.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    })),
    timestamp: new Date().toISOString()
  }, { status: 400 });
};

// Generic validation middleware
export function withValidation<T extends z.ZodSchema>(
  schema: T,
  handler: (req: NextRequest, data: z.infer<T>) => Promise<NextResponse>
) {
  return withApiPerformanceTracking(async (req: NextRequest) => {
    try {
      let data: z.infer<T>;

      if (req.method === 'GET') {
        // Parse query parameters
        const url = new URL(req.url);
        const queryData = Object.fromEntries(url.searchParams.entries());
        data = schema.parse(queryData);
      } else {
        // Parse JSON body
        const body = await req.json().catch(() => ({}));
        data = schema.parse(body);
      }

      return await handler(req, data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return validationErrorResponse(error);
      }
      throw error;
    }
  });
}

// Partial validation for updates
export function withPartialValidation<T extends z.ZodObject<any>>(
  schema: T,
  handler: (req: NextRequest, data: Partial<z.infer<T>>) => Promise<NextResponse>
) {
  return withApiPerformanceTracking(async (req: NextRequest) => {
    try {
      let data: Partial<z.infer<T>>;

      if (req.method === 'GET') {
        // Parse query parameters
        const url = new URL(req.url);
        const queryData = Object.fromEntries(url.searchParams.entries());
        data = schema.partial().parse(queryData);
      } else {
        // Parse JSON body
        const body = await req.json().catch(() => ({}));
        data = schema.partial().parse(body);
      }

      return await handler(req, data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return validationErrorResponse(error);
      }
      throw error;
    }
  });
}

// Array validation
export function withArrayValidation<T extends z.ZodObject<any>>(
  schema: T,
  handler: (req: NextRequest, data: z.infer<T>[]) => Promise<NextResponse>
) {
  return withApiPerformanceTracking(async (req: NextRequest) => {
    try {
      const body = await req.json().catch(() => ({}));
      const data = z.array(schema).parse(body);
      return await handler(req, data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return validationErrorResponse(error);
      }
      throw error;
    }
  });
}

// Custom validation functions
export const validateEmail = (email: string): boolean => {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
};

export const validatePassword = (password: string): boolean => {
  try {
    passwordSchema.parse(password);
    return true;
  } catch {
    return false;
  }
};

export const validateUrl = (url: string): boolean => {
  try {
    urlSchema.parse(url);
    return true;
  } catch {
    return false;
  }
};

export const validateUuid = (uuid: string): boolean => {
  try {
    uuidSchema.parse(uuid);
    return true;
  } catch {
    return false;
  }
};

// Sanitization functions
export const sanitizeString = (str: string, maxLength: number = 1000): string => {
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, maxLength);
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const sanitizeUrl = (url: string): string => {
  return url.trim().toLowerCase();
};

// Export all schemas for use in other modules
export const schemas = {
  user: {
    create: userCreateSchema,
    update: userUpdateSchema,
    login: userLoginSchema
  },
  agent: {
    create: agentCreateSchema,
    update: agentUpdateSchema,
    deploy: agentDeploySchema
  },
  deployment: {
    create: deploymentCreateSchema,
    update: deploymentUpdateSchema
  },
  feedback: {
    create: feedbackCreateSchema,
    update: feedbackUpdateSchema
  },
  file: {
    upload: fileUploadSchema
  },
  payment: {
    create: paymentCreateSchema
  },
  subscription: {
    create: subscriptionCreateSchema
  },
  search: {
    query: searchQuerySchema
  },
  api: {
    response: apiResponseSchema
  }
}; 