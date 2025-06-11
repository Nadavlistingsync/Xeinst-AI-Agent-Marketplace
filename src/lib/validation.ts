import { z } from 'zod';
import { NextResponse } from 'next/server';

export const paginationSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  orderBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine(data => data.endDate >= data.startDate, {
  message: "End date must be after start date",
});

export const filterSchema = z.object({
  userId: z.string().optional(),
  productId: z.string().optional(),
  agentId: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  level: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const metricsSchema = z.object({
  totalRequests: z.number().int().min(0),
  averageResponseTime: z.number().min(0),
  errorRate: z.number().min(0).max(1),
  successRate: z.number().min(0).max(1),
  activeUsers: z.number().int().min(0),
  requestsPerMinute: z.number().min(0),
  averageTokensUsed: z.number().int().min(0),
  costPerRequest: z.number().min(0),
  totalCost: z.number().min(0),
});

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['user', 'admin']).default('user'),
  image: z.string().url('Invalid image URL').optional()
});

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be a positive number'),
  category: z.string().min(1, 'Category is required'),
  images: z.array(z.string().url('Invalid image URL')),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  accessLevel: z.enum(['free', 'premium']).default('free'),
  licenseType: z.enum(['personal', 'commercial']).default('personal'),
  earningsSplit: z.number().min(0).max(100).default(70)
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
  productId: z.string().uuid('Invalid product ID')
});

export const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
  sentimentScore: z.number().min(-1).max(1),
  deploymentId: z.string().uuid('Invalid deployment ID')
});

export const fileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  type: z.string().min(1, 'File type is required'),
  size: z.number().min(1, 'File size must be greater than 0'),
  url: z.string().url('Invalid file URL'),
  metadata: z.record(z.any()).optional()
});

export const notificationSchema = z.object({
  type: z.enum(['info', 'success', 'warning', 'error']),
  message: z.string().min(1, 'Message is required'),
  userId: z.string().uuid('Invalid user ID'),
  metadata: z.record(z.any()).optional()
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type FilterInput = z.infer<typeof filterSchema>;
export type MetricsInput = z.infer<typeof metricsSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type FileInput = z.infer<typeof fileSchema>;
export type NotificationInput = z.infer<typeof notificationSchema>;

export function withValidation<T extends z.ZodType>(
  schema: T,
  handler: (request: Request, context: any) => Promise<NextResponse>
) {
  return async (request: Request, context: any): Promise<NextResponse> => {
    try {
      const body = await request.json();
      const validatedData = schema.parse(body);
      
      // Create a new request with the validated data
      const newRequest = new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(validatedData)
      });

      return handler(newRequest, context);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Validation error', 
            details: error.errors 
          },
          { status: 400 }
        );
      }
      throw error;
    }
  };
} 