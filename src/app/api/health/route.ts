import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/api';
import { 
  type HealthCheckApiResponse,
  healthCheckSchema,
  type HealthCheckInput
} from '@/types/health';

export async function GET(): Promise<NextResponse<HealthCheckApiResponse>> {
  try {
    const startTime = Date.now();
    
    // Check database connection
    const dbStatus = await checkDatabase();
    
    // Check external services
    const services = await checkExternalServices();
    
    // Calculate overall status
    const status = calculateOverallStatus(dbStatus, services);
    
    const healthCheck: HealthCheckInput = {
      status,
      timestamp: new Date(),
      services: {
        database: {
          status: dbStatus.status,
          latency: dbStatus.latency,
          ...(dbStatus.error && { error: dbStatus.error }),
        },
        ...services,
      },
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
    };

    const validatedHealthCheck = healthCheckSchema.parse(healthCheck);

    return NextResponse.json({
      success: true,
      data: validatedHealthCheck,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      createErrorResponse(error, 'Health check failed'),
      { status: 500 }
    );
  }
}

async function checkDatabase() {
  const startTime = Date.now();
  try {
    // Add your database health check logic here
    // For example, try to connect to the database and run a simple query
    return {
      status: 'healthy' as const,
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      status: 'unhealthy' as const,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Database check failed',
    };
  }
}

async function checkExternalServices() {
  const services: Record<string, {
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    error?: string;
  }> = {};

  // Add your external service health checks here
  // For example, check API endpoints, third-party services, etc.

  return services;
}

function calculateOverallStatus(
  dbStatus: { status: 'healthy' | 'degraded' | 'unhealthy' },
  services: Record<string, { status: 'healthy' | 'degraded' | 'unhealthy' }>
): 'healthy' | 'degraded' | 'unhealthy' {
  if (dbStatus.status === 'unhealthy') {
    return 'unhealthy';
  }

  const serviceStatuses = Object.values(services).map(s => s.status);
  if (serviceStatuses.includes('unhealthy')) {
    return 'unhealthy';
  }
  if (serviceStatuses.includes('degraded') || dbStatus.status === 'degraded') {
    return 'degraded';
  }

  return 'healthy';
} 