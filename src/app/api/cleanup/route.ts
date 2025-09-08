import { NextResponse } from 'next/server';
import { cleanupExpiredFiles } from '@/lib/upload';
import { prisma } from '@/lib/prisma';

// Cleanup expired files and old execution records
export async function POST(): Promise<NextResponse> {
  try {
    // Clean up expired temporary files
    const deletedFiles = await cleanupExpiredFiles();

    // Clean up old execution records (older than 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const deletedExecutions = await prisma.agentExecution.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        },
        status: {
          in: ['completed', 'failed']
        }
      }
    });

    // Clean up old output files
    const deletedOutputFiles = await prisma.agentOutputFile.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    return NextResponse.json({
      success: true,
      cleanup: {
        expiredFiles: deletedFiles,
        oldExecutions: deletedExecutions.count,
        oldOutputFiles: deletedOutputFiles.count,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}

// Get cleanup statistics
export async function GET(): Promise<NextResponse> {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Count expired files
    const expiredFiles = await prisma.tempFile.count({
      where: {
        expiresAt: {
          lt: now
        }
      }
    });

    // Count old executions
    const oldExecutions = await prisma.agentExecution.count({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        },
        status: {
          in: ['completed', 'failed']
        }
      }
    });

    // Count old output files
    const oldOutputFiles = await prisma.agentOutputFile.count({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    // Count total temp files
    const totalTempFiles = await prisma.tempFile.count();

    // Count total executions
    const totalExecutions = await prisma.agentExecution.count();

    return NextResponse.json({
      success: true,
      statistics: {
        expiredFiles,
        oldExecutions,
        oldOutputFiles,
        totalTempFiles,
        totalExecutions,
        timestamp: now.toISOString()
      }
    });

  } catch (error) {
    console.error('Cleanup statistics error:', error);
    return NextResponse.json(
      { error: 'Failed to get cleanup statistics' },
      { status: 500 }
    );
  }
}
