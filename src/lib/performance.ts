import { NextRequest, NextResponse } from 'next/server';

export interface PerformanceMetrics {
  timestamp: number;
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics

  trackOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now();
    
    return fn()
      .then((result) => {
        this.recordMetric({
          timestamp: startTime,
          operation,
          duration: Date.now() - startTime,
          success: true,
          metadata
        });
        return result;
      })
      .catch((error) => {
        this.recordMetric({
          timestamp: startTime,
          operation,
          duration: Date.now() - startTime,
          success: false,
          error: error.message,
          metadata
        });
        throw error;
      });
  }

  trackSyncOperation<T>(
    operation: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    const startTime = Date.now();
    
    try {
      const result = fn();
      this.recordMetric({
        timestamp: startTime,
        operation,
        duration: Date.now() - startTime,
        success: true,
        metadata
      });
      return result;
    } catch (error) {
      this.recordMetric({
        timestamp: startTime,
        operation,
        duration: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata
      });
      throw error;
    }
  }

  private recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    
    // Keep only the last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getMetricsByOperation(operation: string): PerformanceMetrics[] {
    return this.metrics.filter(m => m.operation === operation);
  }

  getAverageResponseTime(operation?: string): number {
    const metrics = operation 
      ? this.getMetricsByOperation(operation)
      : this.metrics;
    
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  getSuccessRate(operation?: string): number {
    const metrics = operation 
      ? this.getMetricsByOperation(operation)
      : this.metrics;
    
    if (metrics.length === 0) return 0;
    
    const successful = metrics.filter(m => m.success).length;
    return successful / metrics.length;
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Middleware to track API performance
export function withPerformanceTracking<T extends any[], R>(
  operation: string,
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    return performanceMonitor.trackOperation(operation, () => fn(...args));
  };
}

// API route wrapper for performance tracking
export function withApiPerformanceTracking(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const url = req.nextUrl.pathname;
    const method = req.method;
    const operation = `${method} ${url}`;
    
    return performanceMonitor.trackOperation(
      operation,
      () => handler(req),
      {
        url,
        method,
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || req.ip
      }
    );
  };
}

// Database query performance tracking
export function withDbPerformanceTracking<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  return performanceMonitor.trackOperation(
    `DB_${operation}`,
    fn,
    { type: 'database' }
  );
}

// Export performance data for monitoring
export function getPerformanceReport() {
  const metrics = performanceMonitor.getMetrics();
  const recentMetrics = metrics.filter(
    m => m.timestamp > Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
  );

  return {
    totalOperations: metrics.length,
    recentOperations: recentMetrics.length,
    averageResponseTime: performanceMonitor.getAverageResponseTime(),
    successRate: performanceMonitor.getSuccessRate(),
    topOperations: getTopOperations(metrics),
    recentErrors: getRecentErrors(metrics),
    timestamp: Date.now()
  };
}

function getTopOperations(metrics: PerformanceMetrics[]) {
  const operationCounts = metrics.reduce((acc, m) => {
    acc[m.operation] = (acc[m.operation] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(operationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([operation, count]) => ({
      operation,
      count,
      avgResponseTime: performanceMonitor.getAverageResponseTime(operation),
      successRate: performanceMonitor.getSuccessRate(operation)
    }));
}

function getRecentErrors(metrics: PerformanceMetrics[]) {
  const recentMetrics = metrics.filter(
    m => m.timestamp > Date.now() - 60 * 60 * 1000 // Last hour
  );

  return recentMetrics
    .filter(m => !m.success)
    .map(m => ({
      operation: m.operation,
      error: m.error,
      timestamp: m.timestamp,
      metadata: m.metadata
    }))
    .slice(0, 20); // Last 20 errors
} 