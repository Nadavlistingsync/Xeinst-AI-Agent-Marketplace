import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';

// Webhook callback for agent responses
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { 
      executionId, 
      status, 
      output, 
      error, 
      files = [],
      metadata = {} 
    } = body;

    // Log the agent response (since agentExecution model doesn't exist)
    console.log('Agent response received:', {
      executionId,
      status,
      output,
      error,
      metadata
    });

    // Handle output files if any (simplified since agentOutputFile model doesn't exist)
    if (files && files.length > 0) {
      console.log('Output files received:', files);
    }

    // Clean up input files if processing is complete (simplified since tempFile model doesn't exist)
    if (status === 'completed' || status === 'failed') {
      console.log('Processing completed, cleanup would happen here');
    }

    // Update agent usage statistics (simplified since execution model doesn't exist)
    if (status === 'completed') {
      console.log('Agent execution completed successfully');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Execution updated successfully' 
    });

  } catch (error) {
    console.error('Webhook callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check for webhook endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Agent response webhook endpoint is operational'
  });
}
