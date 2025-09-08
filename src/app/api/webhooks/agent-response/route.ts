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

    // Verify execution exists
    const execution = await prisma.agentExecution.findUnique({
      where: { id: executionId }
    });

    if (!execution) {
      return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
    }

    // Update execution with results
    const updateData: any = {
      status,
      completedAt: new Date()
    };

    if (output) {
      updateData.output = JSON.stringify(output);
    }

    if (error) {
      updateData.error = error;
    }

    if (metadata) {
      updateData.metadata = JSON.stringify(metadata);
    }

    await prisma.agentExecution.update({
      where: { id: executionId },
      data: updateData
    });

    // Handle output files if any
    if (files && files.length > 0) {
      for (const file of files) {
        // Store output file information
        await prisma.agentOutputFile.create({
          data: {
            executionId,
            name: file.name,
            type: file.type,
            size: file.size,
            url: file.url || null,
            content: file.content || null, // base64 encoded content
            metadata: file.metadata ? JSON.stringify(file.metadata) : null
          }
        });
      }
    }

    // Clean up input files if processing is complete
    if (status === 'completed' || status === 'failed') {
      const inputFiles = await prisma.tempFile.findMany({
        where: { 
          id: { in: execution.fileIds },
          status: 'processing'
        }
      });

      for (const file of inputFiles) {
        try {
          // Delete physical file
          await unlink(file.path);
          
          // Delete database record
          await prisma.tempFile.delete({
            where: { id: file.id }
          });
        } catch (fileError) {
          console.warn(`Failed to cleanup input file ${file.id}:`, fileError);
        }
      }
    }

    // Update agent usage statistics
    if (status === 'completed') {
      await prisma.agent.update({
        where: { id: execution.agentId },
        data: {
          totalRuns: { increment: 1 },
          lastRunAt: new Date()
        }
      });

      // Update user credits if applicable
      await prisma.user.update({
        where: { id: execution.userId },
        data: {
          creditsUsed: { increment: 1 }
        }
      });
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
