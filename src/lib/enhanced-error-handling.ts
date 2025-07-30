import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { captureException } from '@/lib/sentry';

// Enhanced error types with better categorization
export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATABASE = 'database',
  RATE_LIMIT = 'rate_limit',
  FILE_UPLOAD = 'file_upload',
  AGENT_EXECUTION = 'agent_execution',
  PAYMENT = 'payment',
  UNKNOWN = 'unknown'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface EnhancedApiError {
  message: string;
  status: number;
  code?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  details?: unknown;
  retryable: boolean;
  retryAfter?: number;
  userMessage: string;
  suggestedActions?: string[];
  timestamp: string;
  requestId?: string;
}

export class EnhancedAppError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public category: ErrorCategory = ErrorCategory.UNKNOWN,
    public severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    public code?: string,
    public details?: unknown,
    public retryable: boolean = false,
    public retryAfter?: number,
    public userMessage?: string,
    public suggestedActions?: string[]
  ) {
    super(message);
    this.name = 'EnhancedAppError';
  }
}

// Error message templates for better user experience
const ERROR_MESSAGES = {
  [ErrorCategory.NETWORK]: {
    userMessage: 'Connection failed. Please check your internet connection and try again.',
    suggestedActions: ['Check your internet connection', 'Try again in a few moments', 'Contact support if the problem persists']
  },
  [ErrorCategory.VALIDATION]: {
    userMessage: 'Please check your input and try again.',
    suggestedActions: ['Review the form fields', 'Ensure all required fields are filled', 'Check for any special characters']
  },
  [ErrorCategory.AUTHENTICATION]: {
    userMessage: 'Please sign in to continue.',
    suggestedActions: ['Sign in to your account', 'Check your credentials', 'Reset your password if needed']
  },
  [ErrorCategory.AUTHORIZATION]: {
    userMessage: 'You don\'t have permission to perform this action.',
    suggestedActions: ['Contact your administrator', 'Check your account permissions', 'Upgrade your plan if needed']
  },
  [ErrorCategory.DATABASE]: {
    userMessage: 'We\'re experiencing technical difficulties. Please try again later.',
    suggestedActions: ['Try again in a few moments', 'Contact support if the problem persists', 'Check our status page']
  },
  [ErrorCategory.RATE_LIMIT]: {
    userMessage: 'Too many requests. Please wait a moment before trying again.',
    suggestedActions: ['Wait a few moments before retrying', 'Reduce the frequency of requests', 'Contact support if needed']
  },
  [ErrorCategory.FILE_UPLOAD]: {
    userMessage: 'File upload failed. Please check your file and try again.',
    suggestedActions: ['Check file size and format', 'Ensure the file is not corrupted', 'Try uploading a smaller file']
  },
  [ErrorCategory.AGENT_EXECUTION]: {
    userMessage: 'Agent execution failed. Please try again or contact support.',
    suggestedActions: ['Try running the agent again', 'Check agent configuration', 'Contact support for assistance']
  },
  [ErrorCategory.PAYMENT]: {
    userMessage: 'Payment processing failed. Please try again or contact support.',
    suggestedActions: ['Check your payment method', 'Ensure sufficient funds', 'Contact support for assistance']
  },
  [ErrorCategory.UNKNOWN]: {
    userMessage: 'Something went wrong. Please try again or contact support.',
    suggestedActions: ['Try the action again', 'Refresh the page', 'Contact support for assistance']
  }
};

// Enhanced error handling function
export function handleEnhancedApiError(error: unknown, context?: Record<string, unknown>): EnhancedApiError {
  const timestamp = new Date().toISOString();
  const requestId = context?.requestId as string || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Handle known error types with enhanced categorization
  if (error instanceof EnhancedAppError) {
    return {
      message: error.message,
      status: error.status,
      code: error.code,
      category: error.category,
      severity: error.severity,
      details: error.details,
      retryable: error.retryable,
      retryAfter: error.retryAfter,
      userMessage: error.userMessage || ERROR_MESSAGES[error.category].userMessage,
      suggestedActions: error.suggestedActions || ERROR_MESSAGES[error.category].suggestedActions,
      timestamp,
      requestId
    };
  }

  if (error instanceof ZodError) {
    return {
      message: 'Validation error',
      status: 400,
      code: 'VALIDATION_ERROR',
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      details: error.errors,
      retryable: false,
      userMessage: ERROR_MESSAGES[ErrorCategory.VALIDATION].userMessage,
      suggestedActions: ERROR_MESSAGES[ErrorCategory.VALIDATION].suggestedActions,
      timestamp,
      requestId
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const category = getPrismaErrorCategory(error.code);
    const severity = getPrismaErrorSeverity(error.code);
    const retryable = isPrismaErrorRetryable(error.code);
    
    return {
      message: error.message,
      status: 400,
      code: error.code,
      category,
      severity,
      details: error.meta,
      retryable,
      userMessage: ERROR_MESSAGES[category].userMessage,
      suggestedActions: ERROR_MESSAGES[category].suggestedActions,
      timestamp,
      requestId
    };
  }

  if (error instanceof Error) {
    // Categorize based on error message patterns
    const category = categorizeErrorByMessage(error.message);
    const severity = getSeverityByCategory(category);
    
    return {
      message: error.message,
      status: 500,
      code: error.name,
      category,
      severity,
      details: context,
      retryable: isRetryableError(error),
      userMessage: ERROR_MESSAGES[category].userMessage,
      suggestedActions: ERROR_MESSAGES[category].suggestedActions,
      timestamp,
      requestId
    };
  }

  // Handle unknown error types
  console.error('Unknown Error:', error);
  return {
    message: 'An unexpected error occurred',
    status: 500,
    code: 'UNKNOWN_ERROR',
    category: ErrorCategory.UNKNOWN,
    severity: ErrorSeverity.HIGH,
    details: error,
    retryable: false,
    userMessage: ERROR_MESSAGES[ErrorCategory.UNKNOWN].userMessage,
    suggestedActions: ERROR_MESSAGES[ErrorCategory.UNKNOWN].suggestedActions,
    timestamp,
    requestId
  };
}

// Helper functions for error categorization
function getPrismaErrorCategory(code: string): ErrorCategory {
  switch (code) {
    case 'P2002': return ErrorCategory.VALIDATION; // Unique constraint
    case 'P2025': return ErrorCategory.DATABASE; // Record not found
    case 'P2003': return ErrorCategory.DATABASE; // Foreign key constraint
    case 'P2014': return ErrorCategory.DATABASE; // Invalid ID
    default: return ErrorCategory.DATABASE;
  }
}

function getPrismaErrorSeverity(code: string): ErrorSeverity {
  switch (code) {
    case 'P2002': return ErrorSeverity.MEDIUM; // Unique constraint
    case 'P2025': return ErrorSeverity.LOW; // Record not found
    case 'P2003': return ErrorSeverity.HIGH; // Foreign key constraint
    case 'P2014': return ErrorSeverity.MEDIUM; // Invalid ID
    default: return ErrorSeverity.MEDIUM;
  }
}

function isPrismaErrorRetryable(_code: string): boolean {
  // Most Prisma errors are not retryable
  return false;
}

function categorizeErrorByMessage(message: string): ErrorCategory {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('network') || lowerMessage.includes('connection') || lowerMessage.includes('fetch')) {
    return ErrorCategory.NETWORK;
  }
  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
    return ErrorCategory.VALIDATION;
  }
  if (lowerMessage.includes('auth') || lowerMessage.includes('login') || lowerMessage.includes('unauthorized')) {
    return ErrorCategory.AUTHENTICATION;
  }
  if (lowerMessage.includes('forbidden') || lowerMessage.includes('permission')) {
    return ErrorCategory.AUTHORIZATION;
  }
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
    return ErrorCategory.RATE_LIMIT;
  }
  if (lowerMessage.includes('upload') || lowerMessage.includes('file')) {
    return ErrorCategory.FILE_UPLOAD;
  }
  if (lowerMessage.includes('payment') || lowerMessage.includes('stripe')) {
    return ErrorCategory.PAYMENT;
  }
  if (lowerMessage.includes('agent') || lowerMessage.includes('execution')) {
    return ErrorCategory.AGENT_EXECUTION;
  }
  
  return ErrorCategory.UNKNOWN;
}

function getSeverityByCategory(category: ErrorCategory): ErrorSeverity {
  switch (category) {
    case ErrorCategory.NETWORK:
    case ErrorCategory.RATE_LIMIT:
      return ErrorSeverity.LOW;
    case ErrorCategory.VALIDATION:
    case ErrorCategory.AUTHENTICATION:
      return ErrorSeverity.MEDIUM;
    case ErrorCategory.AUTHORIZATION:
    case ErrorCategory.FILE_UPLOAD:
    case ErrorCategory.AGENT_EXECUTION:
      return ErrorSeverity.HIGH;
    case ErrorCategory.DATABASE:
    case ErrorCategory.PAYMENT:
    case ErrorCategory.UNKNOWN:
      return ErrorSeverity.CRITICAL;
    default:
      return ErrorSeverity.MEDIUM;
  }
}

function isRetryableError(error: Error): boolean {
  const retryablePatterns = [
    'network',
    'connection',
    'timeout',
    'rate limit',
    'temporary',
    'temporarily unavailable'
  ];
  
  return retryablePatterns.some(pattern => 
    error.message.toLowerCase().includes(pattern)
  );
}

// Enhanced error response creator
export function createEnhancedErrorResponse(error: unknown, context?: Record<string, unknown>) {
  const enhancedError = handleEnhancedApiError(error, context);
  
  // Report to Sentry for critical errors
  if (enhancedError.severity === ErrorSeverity.CRITICAL) {
    captureException(error instanceof Error ? error : new Error(enhancedError.message), {
      ...enhancedError,
      ...context
    });
  }
  
  return NextResponse.json(
    {
      error: enhancedError.userMessage,
      details: enhancedError.details,
      category: enhancedError.category,
      retryable: enhancedError.retryable,
      retryAfter: enhancedError.retryAfter,
      suggestedActions: enhancedError.suggestedActions,
      requestId: enhancedError.requestId,
      timestamp: enhancedError.timestamp
    },
    { 
      status: enhancedError.status,
      headers: {
        'X-Error-Category': enhancedError.category,
        'X-Error-Severity': enhancedError.severity,
        'X-Retryable': enhancedError.retryable.toString(),
        ...(enhancedError.retryAfter && { 'Retry-After': enhancedError.retryAfter.toString() })
      }
    }
  );
}

// Enhanced error handling wrapper
export async function withEnhancedErrorHandling<T>(
  operation: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const enhancedError = handleEnhancedApiError(error, context);
    throw new EnhancedAppError(
      enhancedError.message,
      enhancedError.status,
      enhancedError.category,
      enhancedError.severity,
      enhancedError.code,
      enhancedError.details,
      enhancedError.retryable,
      enhancedError.retryAfter,
      enhancedError.userMessage,
      enhancedError.suggestedActions
    );
  }
} 