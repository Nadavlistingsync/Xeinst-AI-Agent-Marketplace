import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPerformanceReport } from '@/lib/performance';
import { withApiPerformanceTracking } from '@/lib/performance';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime: number;
      error?: string;
    };
    performance: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      averageResponseTime: number;
      successRate: number;
      recentErrors: number;
    };
    memory: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      used: number;
      total: number;
      percentage: number;
    };
    environment: {
      status: 'healthy' | 'unhealthy';
      nodeEnv: string;
      databaseUrl: boolean;
      stripeKey: boolean;
      nextAuthSecret: boolean;
    };
  };
}

async function checkDatabase(): Promise<{ status: 'healthy' | 'unhealthy'; responseTime: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    // Test database connectivity with a simple query
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      status: 'unhealthy',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}

function checkMemory(): { status: 'healthy' | 'degraded' | 'unhealthy'; used: number; total: number; percentage: number } {
  const memUsage = process.memoryUsage();
  const used = memUsage.heapUsed;
  const total = memUsage.heapTotal;
  const percentage = (used / total) * 100;
  
  let status: 'healthy' | 'degraded' | 'unhealthy';
  if (percentage < 70) {
    status = 'healthy';
  } else if (percentage < 90) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }
  
  return {
    status,
    used: Math.round(used / 1024 / 1024), // MB
    total: Math.round(total / 1024 / 1024), // MB
    percentage: Math.round(percentage)
  };
}

function checkEnvironment(): { status: 'healthy' | 'unhealthy'; nodeEnv: string; databaseUrl: boolean; stripeKey: boolean; nextAuthSecret: boolean } {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const databaseUrl = !!process.env.DATABASE_URL;
  const stripeKey = !!process.env.STRIPE_SECRET_KEY;
  const nextAuthSecret = !!process.env.NEXTAUTH_SECRET;
  
  const status = databaseUrl && nextAuthSecret ? 'healthy' : 'unhealthy';
  
  return {
    status,
    nodeEnv,
    databaseUrl,
    stripeKey,
    nextAuthSecret
  };
}

function checkPerformance(): { status: 'healthy' | 'degraded' | 'unhealthy'; averageResponseTime: number; successRate: number; recentErrors: number } {
  const report = getPerformanceReport();
  const { averageResponseTime, successRate } = report;
  // If recentErrors is an array, use its length; otherwise, use as is
  let recentErrors: number = 0;
  if (Array.isArray(report.recentErrors)) {
    recentErrors = report.recentErrors.length;
  } else {
    recentErrors = typeof report.recentErrors === 'number' ? report.recentErrors : 0;
  }
  
  let status: 'healthy' | 'degraded' | 'unhealthy';
  
  // Determine status based on performance metrics
  if (averageResponseTime < 1000 && successRate > 0.95 && recentErrors < 5) {
    status = 'healthy';
  } else if (averageResponseTime < 3000 && successRate > 0.90 && recentErrors < 20) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }
  
  return {
    status,
    averageResponseTime: Math.round(averageResponseTime),
    successRate: Math.round(successRate * 100) / 100,
    recentErrors
  };
}

function determineOverallStatus(checks: HealthCheckResult['checks']): 'healthy' | 'degraded' | 'unhealthy' {
  const { database, performance, memory, environment } = checks;
  
  // If any critical service is unhealthy, overall status is unhealthy
  if (database.status === 'unhealthy' || environment.status === 'unhealthy') {
    return 'unhealthy';
  }
  
  // If any service is degraded, overall status is degraded
  if (performance.status === 'degraded' || memory.status === 'degraded') {
    return 'degraded';
  }
  
  return 'healthy';
}

export const GET = withApiPerformanceTracking(async () => {
  try {
    // Run all health checks in parallel
    const [databaseCheck, memoryCheck, environmentCheck, performanceCheck] = await Promise.all([
      checkDatabase(),
      Promise.resolve(checkMemory()),
      Promise.resolve(checkEnvironment()),
      Promise.resolve(checkPerformance())
    ]);
    
    const checks: HealthCheckResult['checks'] = {
      database: databaseCheck,
      performance: performanceCheck,
      memory: memoryCheck,
      environment: environmentCheck
    };
    
    const overallStatus = determineOverallStatus(checks);
    
    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      checks
    };
    
    // Set appropriate HTTP status code
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
    
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorResult: HealthCheckResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: { status: 'unhealthy', responseTime: 0, error: 'Health check failed' },
        performance: { status: 'unhealthy', averageResponseTime: 0, successRate: 0, recentErrors: 0 },
        memory: { status: 'unhealthy', used: 0, total: 0, percentage: 0 },
        environment: { status: 'unhealthy', nodeEnv: 'unknown', databaseUrl: false, stripeKey: false, nextAuthSecret: false }
      }
    };
    
    return NextResponse.json(errorResult, { status: 503 });
  }
}); 