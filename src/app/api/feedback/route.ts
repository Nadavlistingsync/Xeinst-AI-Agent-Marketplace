import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AgentFeedback } from '@/prisma/schema';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Store feedback in database
    const feedback = await db.agentFeedback.create({
      data: {
        type: data.type,
        message: data.message,
        details: data.details || {},
        timestamp: new Date(),
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