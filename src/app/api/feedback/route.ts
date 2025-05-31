import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentFeedbacks } from '@/lib/schema';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.type || !data.message) {
      return NextResponse.json(
        { success: false, error: 'Type and message are required' },
        { status: 400 }
      );
    }

    // Calculate rating based on type
    const rating = data.type === 'error' ? 1 : data.type === 'warning' ? 2 : 5;
    
    // Store feedback in database using Drizzle
    const feedback = await db.insert(agentFeedbacks).values({
      id: uuidv4(),
      agentId: 'system', // Using 'system' for general feedback
      userId: 'system', // Using 'system' for general feedback
      rating,
      comment: data.message,
      created_at: new Date(),
      updated_at: new Date(),
    }).returning();

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Feedback received:', feedback);
    }

    return NextResponse.json({ success: true, feedback: feedback[0] });
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
} 