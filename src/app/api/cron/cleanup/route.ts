import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiPerformanceTracking } from '@/lib/performance';
import { jobQueue } from '@/lib/background-jobs';

export const GET = withApiPerformanceTracking(async (req: NextRequest) => {
  try {
    const startTime = Date.now();
    const cleanupResults = {
      sessions: 0,
      logs: 0,
      tempFiles: 0,
      rateLimitLogs: 0,
      oldJobs: 0,
      duration: 0
    };

    // Clean up expired sessions (older than 30 days)
    const sessionResult = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });
    cleanupResults.sessions = sessionResult.count;

    // Clean up old agent logs (older than 90 days)
    const logResult = await prisma.agentLog.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        }
      }
    });
    cleanupResults.logs = logResult.count;

    // Clean up old rate limit logs (older than 30 days)
    const rateLimitResult = await prisma.rateLimitLog.deleteMany({
      where: {
        timestamp: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });
    cleanupResults.rateLimitLogs = rateLimitResult.count;

    // Clean up old completed/failed jobs (older than 7 days)
    const jobResult = await prisma.job.deleteMany({
      where: {
        status: {
          in: ['completed', 'failed', 'cancelled']
        },
        completedAt: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });
    cleanupResults.oldJobs = jobResult.count;

    // Clean up temporary files (older than 24 hours)
    const fileResult = await prisma.file.deleteMany({
      where: {
        status: 'temp',
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });
    cleanupResults.tempFiles = fileResult.count;

    cleanupResults.duration = Date.now() - startTime;

    // Log cleanup results
    console.log('Cleanup completed:', cleanupResults);

    // Create a backup job for the next day
    await jobQueue.createJob('backup_creation', {
      type: 'daily_cleanup_backup',
      timestamp: new Date().toISOString()
    }, 'low');

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      results: cleanupResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cleanup job failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Cleanup failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}); 