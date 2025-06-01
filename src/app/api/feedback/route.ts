import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createErrorResponse } from '@/lib/api';
import { feedbackSchema, type FeedbackInput, type FeedbackApiResponse } from '@/types/feedback';
import { type Feedback } from '@/types/database';
import { z } from 'zod';

export async function POST(request: Request): Promise<NextResponse<FeedbackApiResponse>> {
  try {
    const data = await request.json();
    
    // Validate required fields
    const validatedData = feedbackSchema.parse(data);

    // Calculate rating based on type
    const rating = validatedData.type === 'error' ? 1 : validatedData.type === 'warning' ? 2 : 5;
    
    // Store feedback in database using Prisma
    const feedback = await prisma.feedback.create({
      data: {
        agentId: validatedData.agentId || 'system',
        userId: validatedData.userId || 'system',
        rating,
        comment: validatedData.message,
        metadata: validatedData.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        agentId: true,
        userId: true,
        rating: true,
        comment: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as Feedback;

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Feedback received:', feedback);
    }

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error('Error processing feedback:', error);
    
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

    const errorResponse = createErrorResponse(error, 'Failed to process feedback');
    return NextResponse.json(
      { 
        success: false, 
        error: errorResponse.error 
      },
      { status: errorResponse.status }
    );
  }
} 