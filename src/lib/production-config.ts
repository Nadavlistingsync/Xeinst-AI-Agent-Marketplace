// Production Configuration with Mock Services for Prototype
// This provides production-quality code structure while using mock services

import { MockServices } from './mock-services';

// Environment Configuration
export const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',

  // Application
  APP_NAME: 'AI Agency Website',
  APP_VERSION: '1.0.0',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/ai_agency_dev',
  DATABASE_POOL_MIN: parseInt(process.env.DATABASE_POOL_MIN || '2'),
  DATABASE_POOL_MAX: parseInt(process.env.DATABASE_POOL_MAX || '10'),

  // Authentication
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',

  // Security
  JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  API_RATE_LIMIT_WINDOW_MS: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '60000'),
  API_RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS || '60'),

  // Agent Execution
  AGENT_EXECUTION_TIMEOUT: parseInt(process.env.AGENT_EXECUTION_TIMEOUT || '30000'),
  AGENT_MAX_FILE_SIZE: parseInt(process.env.AGENT_MAX_FILE_SIZE || '10485760'),
  AGENT_DEFAULT_PRICE: parseInt(process.env.AGENT_DEFAULT_PRICE || '5'),
  AGENT_PLATFORM_FEE_PERCENTAGE: parseInt(process.env.AGENT_PLATFORM_FEE_PERCENTAGE || '20'),

  // Feature Flags
  FEATURES: {
    AGENT_EXECUTION: process.env.FEATURE_AGENT_EXECUTION_ENABLED !== 'false',
    WEB_EMBEDS: process.env.FEATURE_WEB_EMBEDS_ENABLED !== 'false',
    CREDIT_SYSTEM: process.env.FEATURE_CREDIT_SYSTEM_ENABLED !== 'false',
    ANALYTICS: process.env.FEATURE_ANALYTICS_ENABLED !== 'false',
    REAL_TIME_MONITORING: process.env.FEATURE_REAL_TIME_MONITORING !== 'false',
    BACKGROUND_JOBS: process.env.FEATURE_BACKGROUND_JOBS_ENABLED !== 'false',
  },

  // Mock Services (for prototype)
  MOCK_SERVICES: {
    S3: process.env.MOCK_S3_ENABLED === 'true',
    STRIPE: process.env.MOCK_STRIPE_ENABLED === 'true',
    EMAIL: process.env.MOCK_EMAIL_ENABLED === 'true',
    REDIS: process.env.MOCK_REDIS_ENABLED === 'true',
    SENTRY: process.env.MOCK_SENTRY_ENABLED === 'true',
    ANALYTICS: process.env.MOCK_ANALYTICS_ENABLED === 'true',
  },

  // Development
  DEBUG_ENABLED: process.env.DEBUG_ENABLED === 'true',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  API_LOGGING_ENABLED: process.env.API_LOGGING_ENABLED === 'true',
};

// Service Factory - Returns real or mock services based on configuration
export class ServiceFactory {
  static getS3Service() {
    if (config.MOCK_SERVICES.S3) {
      return MockServices.S3;
    }
    // Return real S3 service when configured
    throw new Error('Real S3 service not implemented yet');
  }

  static getStripeService() {
    if (config.MOCK_SERVICES.STRIPE) {
      return MockServices.Stripe;
    }
    // Return real Stripe service when configured
    throw new Error('Real Stripe service not implemented yet');
  }

  static getEmailService() {
    if (config.MOCK_SERVICES.EMAIL) {
      return MockServices.Email;
    }
    // Return real email service when configured
    throw new Error('Real email service not implemented yet');
  }

  static getRedisService() {
    if (config.MOCK_SERVICES.REDIS) {
      return MockServices.Redis;
    }
    // Return real Redis service when configured
    throw new Error('Real Redis service not implemented yet');
  }

  static getSentryService() {
    if (config.MOCK_SERVICES.SENTRY) {
      return MockServices.Sentry;
    }
    // Return real Sentry service when configured
    throw new Error('Real Sentry service not implemented yet');
  }

  static getAnalyticsService() {
    if (config.MOCK_SERVICES.ANALYTICS) {
      return MockServices.Analytics;
    }
    // Return real analytics service when configured
    throw new Error('Real analytics service not implemented yet');
  }

  static getAgentExecutionService() {
    return MockServices.AgentExecution;
  }

  static getWebhookService() {
    return MockServices.Webhook;
  }

  static getRateLimitService() {
    return MockServices.RateLimit;
  }
}

// Production-ready logging
export class Logger {
  private static formatMessage(level: string, message: string, context?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      context,
      environment: config.NODE_ENV,
      version: config.APP_VERSION,
    };

    if (config.IS_DEVELOPMENT) {
      console.log(`[${level.toUpperCase()}] ${message}`, context || '');
    } else {
      console.log(JSON.stringify(logEntry));
    }

    return logEntry;
  }

  static info(message: string, context?: any) {
    return this.formatMessage('info', message, context);
  }

  static warn(message: string, context?: any) {
    return this.formatMessage('warn', message, context);
  }

  static error(message: string, context?: any) {
    return this.formatMessage('error', message, context);
  }

  static debug(message: string, context?: any) {
    if (config.DEBUG_ENABLED) {
      return this.formatMessage('debug', message, context);
    }
  }
}

// Production-ready error handling
export class ErrorHandler {
  static handle(error: Error, context?: any) {
    // Log the error
    Logger.error(error.message, {
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });

    // Send to monitoring service
    const sentryService = ServiceFactory.getSentryService();
    sentryService.captureException(error, context);

    // Return user-friendly error
    return {
      message: config.IS_PRODUCTION 
        ? 'An unexpected error occurred' 
        : error.message,
      code: error.name,
      timestamp: new Date().toISOString(),
    };
  }
}

// Production-ready performance monitoring
export class PerformanceMonitor {
  private static metrics: Map<string, any[]> = new Map();

  static trackOperation(operation: string, duration: number, metadata?: any) {
    const metric = {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      metadata,
    };

    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(metric);

    // Log slow operations
    if (duration > 1000) {
      Logger.warn(`Slow operation detected: ${operation} took ${duration}ms`, metadata);
    }

    return metric;
  }

  static getMetrics(operation?: string) {
    if (operation) {
      return this.metrics.get(operation) || [];
    }
    return Object.fromEntries(this.metrics);
  }

  static clearMetrics() {
    this.metrics.clear();
  }
}

// Production-ready security utilities
export class SecurityUtils {
  static sanitizeInput(input: string): string {
    // Basic XSS prevention
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static generateSecureToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  static hashPassword(password: string): string {
    // In production, use bcrypt or similar
    return Buffer.from(password).toString('base64');
  }

  static validatePassword(password: string): boolean {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
  }
}

// Production-ready validation
export class ValidationUtils {
  static validateRequired(value: any, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw new Error(`${fieldName} is required`);
    }
  }

  static validateString(value: any, fieldName: string, maxLength?: number): void {
    this.validateRequired(value, fieldName);
    if (typeof value !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }
    if (maxLength && value.length > maxLength) {
      throw new Error(`${fieldName} must be less than ${maxLength} characters`);
    }
  }

  static validateNumber(value: any, fieldName: string, min?: number, max?: number): void {
    this.validateRequired(value, fieldName);
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error(`${fieldName} must be a number`);
    }
    if (min !== undefined && num < min) {
      throw new Error(`${fieldName} must be at least ${min}`);
    }
    if (max !== undefined && num > max) {
      throw new Error(`${fieldName} must be at most ${max}`);
    }
  }

  static validateEmail(email: string): void {
    if (!SecurityUtils.validateEmail(email)) {
      throw new Error('Invalid email address');
    }
  }
}

// Production-ready API response utilities
export class ApiResponse {
  static success(data: any, message?: string) {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string, code?: string, details?: any) {
    return {
      success: false,
      error: {
        message,
        code,
        details,
      },
      timestamp: new Date().toISOString(),
    };
  }

  static paginated(data: any[], page: number, limit: number, total: number) {
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

// Export configuration and utilities
export { config as productionConfig }; 