import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "../../../../lib/prisma";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[Webhook Callback] Received:', body);

    // Extract callback data
    const {
      job_id,
      status,
      result,
      error,
      progress,
      metadata
    } = body;

    if (!job_id) {
      return NextResponse.json(
        { success: false, error: 'job_id is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Update the job status in database
    try {
      await prisma.agentLog.create({
        data: {
          deploymentId: job_id,
          level: status === 'completed' ? 'info' : status === 'failed' ? 'error' : 'info',
          message: `Async task ${status}: ${error || 'Completed successfully'}`,
          metadata: {
            job_id,
            status,
            result: status === 'completed' ? result : null,
            error: status === 'failed' ? error : null,
            progress,
            metadata,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (dbError) {
      console.error('Failed to log callback:', dbError);
      // Don't fail the callback if logging fails
    }

    // Notify the user about the completed task
    try {
      // Create notification for the user
      await prisma.notification.create({
        data: {
          userId: metadata?.userId || 'unknown',
          type: 'system_alert',
          message: status === 'completed' 
            ? `Your task has been completed successfully.`
            : `Your task failed: ${error}`,
          metadata: {
            job_id,
            status,
            result: status === 'completed' ? result : null,
            error: status === 'failed' ? error : null,
          },
        },
      });
    } catch (notifyError) {
      console.error('Failed to create notification:', notifyError);
      // Don't fail the callback if notification fails
    }

    return NextResponse.json(
      { success: true, message: 'Callback processed successfully' },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Webhook callback error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process callback',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    );
  }
} 