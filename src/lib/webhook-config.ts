/**
 * Webhook System Configuration
 * Centralized configuration for webhook-based agent execution
 */

export const webhookConfig = {
  // Core webhook settings
  enabled: process.env.ENABLE_WEBHOOKS === 'true',
  timeout: parseInt(process.env.WEBHOOK_TIMEOUT || '30000'),
  maxRetries: parseInt(process.env.WEBHOOK_MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.WEBHOOK_RETRY_DELAY || '1000'),
  
  // Security
  secret: process.env.WEBHOOK_SECRET || 'default-webhook-secret',
  jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret',
  
  // File storage
  tempFile: {
    maxSize: parseInt(process.env.TEMP_FILE_MAX_SIZE || '10485760'), // 10MB
    retentionHours: parseInt(process.env.TEMP_FILE_RETENTION_HOURS || '24'),
    cleanupInterval: parseInt(process.env.TEMP_FILE_CLEANUP_INTERVAL || '3600000'), // 1 hour
  },
  
  // Agent execution
  agent: {
    executionTimeout: parseInt(process.env.AGENT_EXECUTION_TIMEOUT || '30000'),
    maxConcurrent: parseInt(process.env.AGENT_MAX_CONCURRENT_EXECUTIONS || '10'),
    defaultPrice: parseInt(process.env.AGENT_DEFAULT_PRICE || '5'),
    platformFeePercentage: parseInt(process.env.AGENT_PLATFORM_FEE_PERCENTAGE || '20'),
  },
  
  // Rate limiting
  rateLimit: {
    webhook: {
      windowMs: parseInt(process.env.WEBHOOK_RATE_LIMIT_WINDOW_MS || '60000'),
      maxRequests: parseInt(process.env.WEBHOOK_RATE_LIMIT_MAX_REQUESTS || '60'),
    },
    api: {
      windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '60000'),
      maxRequests: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS || '100'),
    },
  },
  
  // Monitoring
  monitoring: {
    enabled: process.env.ENABLE_WEBHOOK_MONITORING === 'true',
    logLevel: process.env.WEBHOOK_LOG_LEVEL || 'info',
    analytics: process.env.ENABLE_WEBHOOK_ANALYTICS === 'true',
  },
  
  // Cleanup
  cleanup: {
    enabled: process.env.ENABLE_AUTO_CLEANUP === 'true',
    intervalHours: parseInt(process.env.CLEANUP_INTERVAL_HOURS || '1'),
    executionRetentionDays: parseInt(process.env.EXECUTION_RETENTION_DAYS || '30'),
    fileRetentionDays: parseInt(process.env.FILE_RETENTION_DAYS || '1'),
  },
  
  // Development
  development: {
    debugWebhooks: process.env.DEBUG_WEBHOOKS === 'true',
    logPayloads: process.env.LOG_WEBHOOK_PAYLOADS === 'true',
    mockResponses: process.env.MOCK_WEBHOOK_RESPONSES === 'true',
  },
  
  // Production
  production: {
    sslVerify: process.env.WEBHOOK_SSL_VERIFY === 'true',
    userAgent: process.env.WEBHOOK_USER_AGENT || 'AI-Agent-Marketplace/1.0',
    defaultHeaders: {
      'Content-Type': 'application/json',
      'User-Agent': process.env.WEBHOOK_USER_AGENT || 'AI-Agent-Marketplace/1.0',
    },
  },
  
  // Integrations
  integrations: {
    n8n: process.env.ENABLE_N8N_INTEGRATION === 'true',
    zapier: process.env.ENABLE_ZAPIER_INTEGRATION === 'true',
    make: process.env.ENABLE_MAKE_INTEGRATION === 'true',
  },
  
  // Security
  security: {
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    allowedWebhookOrigins: process.env.ALLOWED_WEBHOOK_ORIGINS?.split(',') || [
      'https://n8n.io',
      'https://zapier.com',
      'https://make.com'
    ],
  },
  
  // Notifications
  notifications: {
    failureEmail: process.env.WEBHOOK_FAILURE_NOTIFICATION_EMAIL,
    enableAlerts: process.env.ENABLE_WEBHOOK_FAILURE_ALERTS === 'true',
  },
  
  // Testing
  testing: {
    webhookUrl: process.env.TEST_WEBHOOK_URL,
    webhookSecret: process.env.TEST_WEBHOOK_SECRET,
  },
  
  // App URL for callbacks
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

// Validation function
export function validateWebhookConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!webhookConfig.appUrl) {
    errors.push('NEXT_PUBLIC_APP_URL is required for webhook callbacks');
  }
  
  if (!webhookConfig.secret || webhookConfig.secret === 'default-webhook-secret') {
    errors.push('WEBHOOK_SECRET should be set to a secure value');
  }
  
  if (!webhookConfig.jwtSecret || webhookConfig.jwtSecret === 'default-jwt-secret') {
    errors.push('JWT_SECRET should be set to a secure value');
  }
  
  if (webhookConfig.tempFile.maxSize > 50 * 1024 * 1024) { // 50MB
    errors.push('TEMP_FILE_MAX_SIZE should not exceed 50MB for webhook payloads');
  }
  
  if (webhookConfig.agent.executionTimeout < 5000) { // 5 seconds
    errors.push('AGENT_EXECUTION_TIMEOUT should be at least 5 seconds');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Get callback URL for webhook responses
export function getCallbackUrl(): string {
  return `${webhookConfig.appUrl}/api/webhooks/agent-response`;
}

// Get webhook examples URL
export function getWebhookExamplesUrl(): string {
  return `${webhookConfig.appUrl}/api/webhooks/examples`;
}

// Check if webhook system is properly configured
export function isWebhookSystemReady(): boolean {
  const validation = validateWebhookConfig();
  return webhookConfig.enabled && validation.valid;
}

export default webhookConfig;
