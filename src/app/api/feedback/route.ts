import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Store feedback in database
    const feedback = await db.agentFeedback.create({
      data: {
        agentId: 'system', // Using 'system' for general feedback
        userId: 'system', // Using 'system' for general feedback
        rating: data.type === 'error' ? 1 : data.type === 'warning' ? 2 : 5,
        comment: data.message,
        createdAt: new Date(),
      },
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Feedback received:', feedback);
    }

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
} 