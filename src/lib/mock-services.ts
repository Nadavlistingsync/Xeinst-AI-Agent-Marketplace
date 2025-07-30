// Mock Services for Prototype Development
// These simulate external APIs so you can test the full functionality

import { NextResponse } from 'next/server';

// Mock S3 Service
export class MockS3Service {
  private static files = new Map<string, { content: string; metadata: any }>();

  static async uploadFile(key: string, content: string, metadata: any = {}) {
    this.files.set(key, { content, metadata });
    return {
      Location: `https://mock-s3.amazonaws.com/${key}`,
      Key: key,
      ETag: `mock-etag-${Date.now()}`
    };
  }

  static async downloadFile(key: string) {
    const file = this.files.get(key);
    if (!file) {
      throw new Error('File not found');
    }
    return file.content;
  }

  static async deleteFile(key: string) {
    this.files.delete(key);
    return { success: true };
  }

  static async listFiles(prefix: string = '') {
    return Array.from(this.files.keys())
      .filter(key => key.startsWith(prefix))
      .map(key => ({
        Key: key,
        Size: this.files.get(key)?.content.length || 0,
        LastModified: new Date()
      }));
  }
}

// Mock Stripe Service
export class MockStripeService {
  private static customers = new Map<string, any>();
  private static payments = new Map<string, any>();

  static async createCustomer(email: string, name: string) {
    const customerId = `cus_mock_${Date.now()}`;
    const customer = {
      id: customerId,
      email,
      name,
      created: Date.now()
    };
    this.customers.set(customerId, customer);
    return customer;
  }

  static async createPaymentIntent(amount: number, currency: string = 'usd') {
    const paymentIntentId = `pi_mock_${Date.now()}`;
    const paymentIntent = {
      id: paymentIntentId,
      amount,
      currency,
      status: 'succeeded',
      client_secret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`
    };
    this.payments.set(paymentIntentId, paymentIntent);
    return paymentIntent;
  }

  static async createCheckoutSession(params: any) {
    const sessionId = `cs_mock_${Date.now()}`;
    const session = {
      id: sessionId,
      url: `https://mock-stripe.com/checkout/${sessionId}`,
      status: 'open',
      ...params
    };
    return session;
  }

  static async retrieveCustomer(customerId: string) {
    return this.customers.get(customerId) || null;
  }

  static async retrievePaymentIntent(paymentIntentId: string) {
    return this.payments.get(paymentIntentId) || null;
  }
}

// Mock Email Service
export class MockEmailService {
  private static sentEmails: any[] = [];

  static async sendEmail(to: string, subject: string, html: string, text?: string) {
    const email = {
      id: `email_${Date.now()}`,
      to,
      subject,
      html,
      text,
      sentAt: new Date(),
      status: 'sent'
    };
    this.sentEmails.push(email);
    
    console.log('📧 Mock Email Sent:', {
      to,
      subject,
      timestamp: new Date().toISOString()
    });
    
    return email;
  }

  static async sendVerificationEmail(email: string, token: string) {
    return this.sendEmail(
      email,
      'Verify your email address',
      `<h1>Welcome to AI Agency!</h1><p>Click <a href="http://localhost:3000/verify?token=${token}">here</a> to verify your email.</p>`,
      `Welcome to AI Agency! Click here to verify your email: http://localhost:3000/verify?token=${token}`
    );
  }

  static async sendPasswordResetEmail(email: string, token: string) {
    return this.sendEmail(
      email,
      'Reset your password',
      `<h1>Password Reset</h1><p>Click <a href="http://localhost:3000/reset-password?token=${token}">here</a> to reset your password.</p>`,
      `Click here to reset your password: http://localhost:3000/reset-password?token=${token}`
    );
  }

  static getSentEmails() {
    return this.sentEmails;
  }

  static clearSentEmails() {
    this.sentEmails = [];
  }
}

// Mock Redis Service
export class MockRedisService {
  private static store = new Map<string, { value: any; expiry?: number }>();

  static async get(key: string) {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }

  static async set(key: string, value: any, ttlSeconds?: number) {
    const expiry = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : undefined;
    this.store.set(key, { value, expiry });
    return 'OK';
  }

  static async del(key: string) {
    this.store.delete(key);
    return 1;
  }

  static async exists(key: string) {
    return this.store.has(key) ? 1 : 0;
  }

  static async incr(key: string) {
    const current = await this.get(key);
    const newValue = (current || 0) + 1;
    await this.set(key, newValue);
    return newValue;
  }

  static async expire(key: string, seconds: number) {
    const item = this.store.get(key);
    if (item) {
      item.expiry = Date.now() + (seconds * 1000);
    }
    return 1;
  }

  static clear() {
    this.store.clear();
  }
}

// Mock Sentry Service
export class MockSentryService {
  private static events: any[] = [];

  static captureException(error: Error, context?: any) {
    const event = {
      id: `sentry_${Date.now()}`,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      timestamp: new Date(),
      level: 'error'
    };
    this.events.push(event);
    
    console.error('🚨 Mock Sentry Event:', {
      message: error.message,
      timestamp: new Date().toISOString()
    });
    
    return event;
  }

  static captureMessage(message: string, level: string = 'info', context?: any) {
    const event = {
      id: `sentry_${Date.now()}`,
      message,
      context,
      timestamp: new Date(),
      level
    };
    this.events.push(event);
    
    console.log(`📝 Mock Sentry ${level.toUpperCase()}:`, {
      message,
      timestamp: new Date().toISOString()
    });
    
    return event;
  }

  static getEvents() {
    return this.events;
  }

  static clearEvents() {
    this.events = [];
  }
}

// Mock Analytics Service
export class MockAnalyticsService {
  private static events: any[] = [];

  static track(event: string, properties: any = {}) {
    const analyticsEvent = {
      id: `analytics_${Date.now()}`,
      event,
      properties,
      timestamp: new Date(),
      userId: properties.userId || 'anonymous'
    };
    this.events.push(analyticsEvent);
    
    console.log('📊 Mock Analytics Event:', {
      event,
      properties,
      timestamp: new Date().toISOString()
    });
    
    return analyticsEvent;
  }

  static identify(userId: string, traits: any = {}) {
    const identifyEvent = {
      id: `identify_${Date.now()}`,
      userId,
      traits,
      timestamp: new Date()
    };
    this.events.push(identifyEvent);
    
    console.log('👤 Mock Analytics Identify:', {
      userId,
      traits,
      timestamp: new Date().toISOString()
    });
    
    return identifyEvent;
  }

  static getEvents() {
    return this.events;
  }

  static clearEvents() {
    this.events = [];
  }
}

// Mock Agent Execution Service
export class MockAgentExecutionService {
  private static executions: any[] = [];

  static async executeAgent(agentId: string, input: any, options: any = {}) {
    const executionId = `exec_${Date.now()}`;
    const startTime = Date.now();
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
    
    const execution = {
      id: executionId,
      agentId,
      input,
      options,
      startTime: new Date(startTime),
      endTime: new Date(),
      duration: Date.now() - startTime,
      success: Math.random() > 0.1, // 90% success rate
      result: {
        output: `Mock result for agent ${agentId} with input: ${JSON.stringify(input)}`,
        metadata: {
          tokensUsed: Math.floor(Math.random() * 1000) + 100,
          model: 'mock-model-v1',
          processingTime: Date.now() - startTime
        }
      },
      error: null
    };

    if (!execution.success) {
      execution.error = {
        message: 'Mock execution error',
        code: 'MOCK_ERROR',
        details: 'This is a simulated error for testing'
      };
      execution.result = null;
    }

    this.executions.push(execution);
    
    console.log('🤖 Mock Agent Execution:', {
      agentId,
      success: execution.success,
      duration: execution.duration,
      timestamp: new Date().toISOString()
    });
    
    return execution;
  }

  static getExecutions() {
    return this.executions;
  }

  static clearExecutions() {
    this.executions = [];
  }
}

// Mock Webhook Service
export class MockWebhookService {
  private static webhooks: any[] = [];

  static async sendWebhook(url: string, payload: any, headers: any = {}) {
    const webhook = {
      id: `webhook_${Date.now()}`,
      url,
      payload,
      headers,
      timestamp: new Date(),
      status: 'sent',
      response: {
        status: 200,
        body: { success: true }
      }
    };
    this.webhooks.push(webhook);
    
    console.log('🔗 Mock Webhook Sent:', {
      url,
      payload: JSON.stringify(payload).substring(0, 100) + '...',
      timestamp: new Date().toISOString()
    });
    
    return webhook;
  }

  static getWebhooks() {
    return this.webhooks;
  }

  static clearWebhooks() {
    this.webhooks = [];
  }
}

// Mock Rate Limiting Service
export class MockRateLimitService {
  private static limits = new Map<string, { count: number; resetTime: number }>();

  static async checkLimit(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    const current = this.limits.get(key);
    
    if (!current || now > current.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return { success: true, remaining: limit - 1 };
    }
    
    if (current.count >= limit) {
      return { 
        success: false, 
        remaining: 0,
        resetTime: current.resetTime
      };
    }
    
    current.count++;
    this.limits.set(key, current);
    
    return { 
      success: true, 
      remaining: limit - current.count,
      resetTime: current.resetTime
    };
  }

  static clearLimits() {
    this.limits.clear();
  }
}

// Export all mock services
export const MockServices = {
  S3: MockS3Service,
  Stripe: MockStripeService,
  Email: MockEmailService,
  Redis: MockRedisService,
  Sentry: MockSentryService,
  Analytics: MockAnalyticsService,
  AgentExecution: MockAgentExecutionService,
  Webhook: MockWebhookService,
  RateLimit: MockRateLimitService
}; 