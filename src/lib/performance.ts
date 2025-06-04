import * as Sentry from '@sentry/nextjs';
import { setTag, setContext } from './sentry';

interface PerformanceMetrics {
  duration: number;
  startTime: number;
  endTime: number;
  success: boolean;
  error?: Error;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics[]>;
  private readonly maxMetricsPerKey: number;

  private constructor(maxMetricsPerKey = 100) {
    this.metrics = new Map();
    this.maxMetricsPerKey = maxMetricsPerKey;
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  async measure<T>(
    key: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    let result: T;
    let success = true;
    let errorObj: Error | undefined = undefined;
    await Sentry.startSpan({
      name: key,
      op: 'performance'
    }, async (span) => {
      try {
        span.setAttribute('operation', key);
        if (metadata) {
          span.setAttribute('metadata', JSON.stringify(metadata));
        }
        result = await operation();
      } catch (error) {
        success = false;
        errorObj = error as Error;
        throw error;
      }
    });
    const endTime = performance.now();
    const duration = endTime - startTime;
    this.recordMetric(key, {
      duration,
      startTime,
      endTime,
      success,
      error: errorObj,
      metadata,
    });
    if (!success && errorObj) {
      throw errorObj;
    }
    return result!;
  }

  private recordMetric(key: string, metric: PerformanceMetrics) {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const metrics = this.metrics.get(key)!;
    metrics.push(metric);

    // Keep only the most recent metrics
    if (metrics.length > this.maxMetricsPerKey) {
      metrics.shift();
    }

    // Report to monitoring system
    this.reportMetric(key, metric);
  }

  private reportMetric(key: string, metric: PerformanceMetrics) {
    setTag('operation', key);
    setTag('success', String(metric.success));
    setContext('performance', {
      duration: metric.duration,
      startTime: new Date(metric.startTime).toISOString(),
      endTime: new Date(metric.endTime).toISOString(),
      ...metric.metadata,
    });
  }

  getMetrics(key: string): PerformanceMetrics[] {
    return this.metrics.get(key) || [];
  }

  getAverageDuration(key: string): number {
    const metrics = this.getMetrics(key);
    if (metrics.length === 0) return 0;

    const totalDuration = metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return totalDuration / metrics.length;
  }

  getSuccessRate(key: string): number {
    const metrics = this.getMetrics(key);
    if (metrics.length === 0) return 0;

    const successfulOperations = metrics.filter((metric) => metric.success).length;
    return successfulOperations / metrics.length;
  }

  clearMetrics(key?: string) {
    if (key) {
      this.metrics.delete(key);
    } else {
      this.metrics.clear();
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

export async function measurePerformance<T>(
  key: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return performanceMonitor.measure(key, operation, metadata);
} 