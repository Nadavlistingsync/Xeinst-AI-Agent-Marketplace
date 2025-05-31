import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentFeedbacks } from '@/lib/schema';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Store feedback in database using Drizzle
    const feedback = await db.insert(agentFeedbacks).values({
      agent_id: 'system', // Using 'system' for general feedback
      user_id: 'system', // Using 'system' for general feedback
      rating: data.type === 'error' ? 1 : data.type === 'warning' ? 2 : 5,
      comment: data.message,
      created_at: new Date(),
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