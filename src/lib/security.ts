import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// Security Configuration
export const SECURITY_CONFIG = {
  // Encryption
  ENCRYPTION_ALGORITHM: 'aes-256-gcm',
  ENCRYPTION_KEY_LENGTH: 32,
  IV_LENGTH: 16,
  TAG_LENGTH: 16,
  
  // Hashing
  SALT_ROUNDS: 12,
  HASH_ALGORITHM: 'sha256',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  JWT_EXPIRES_IN: '24h',
  JWT_REFRESH_EXPIRES_IN: '7d',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // Session
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_SESSIONS_PER_USER: 5,
  
  // Password Policy
  MIN_PASSWORD_LENGTH: 12,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SYMBOLS: true,
  
  // API Security
  API_KEY_LENGTH: 32,
  API_KEY_PREFIX: 'xeinst_',
  
  // Audit Logging
  AUDIT_LOG_RETENTION_DAYS: 90,
  
  // Compliance
  GDPR_ENABLED: true,
  CCPA_ENABLED: true,
  SOC2_ENABLED: true,
  HIPAA_ENABLED: false, // Enable if needed
} as const;

// Encryption Utilities
export class EncryptionService {
  private static getKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY || crypto.randomBytes(SECURITY_CONFIG.ENCRYPTION_KEY_LENGTH);
    return Buffer.isBuffer(key) ? key : Buffer.from(key, 'hex');
  }

  static encrypt(text: string): string {
    const key = this.getKey();
    const iv = crypto.randomBytes(SECURITY_CONFIG.IV_LENGTH);
    const cipher = crypto.createCipher(SECURITY_CONFIG.ENCRYPTION_ALGORITHM, key);
    cipher.setAAD(Buffer.from('xeinst-enterprise', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  }

  static decrypt(encryptedText: string): string {
    const [, tagHex, encrypted] = encryptedText.split(':');
    const key = this.getKey();
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipher(SECURITY_CONFIG.ENCRYPTION_ALGORITHM, key);
    decipher.setAAD(Buffer.from('xeinst-enterprise', 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Hashing Utilities
export class HashingService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SECURITY_CONFIG.SALT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static hashData(data: string): string {
    return crypto.createHash(SECURITY_CONFIG.HASH_ALGORITHM).update(data).digest('hex');
  }
}

// JWT Utilities
export class JWTService {
  static generateToken(payload: any): string {
    return jwt.sign(payload, SECURITY_CONFIG.JWT_SECRET, {
      expiresIn: SECURITY_CONFIG.JWT_EXPIRES_IN,
      issuer: 'xeinst-enterprise',
      audience: 'xeinst-users',
    });
  }

  static generateRefreshToken(payload: any): string {
    return jwt.sign(payload, SECURITY_CONFIG.JWT_SECRET, {
      expiresIn: SECURITY_CONFIG.JWT_REFRESH_EXPIRES_IN,
      issuer: 'xeinst-enterprise',
      audience: 'xeinst-refresh',
    });
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, SECURITY_CONFIG.JWT_SECRET, {
        issuer: 'xeinst-enterprise',
        audience: 'xeinst-users',
      });
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, SECURITY_CONFIG.JWT_SECRET, {
        issuer: 'xeinst-enterprise',
        audience: 'xeinst-refresh',
      });
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}

// Password Policy Validation
export class PasswordPolicy {
  static validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < SECURITY_CONFIG.MIN_PASSWORD_LENGTH) {
      errors.push(`Password must be at least ${SECURITY_CONFIG.MIN_PASSWORD_LENGTH} characters long`);
    }

    if (SECURITY_CONFIG.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (SECURITY_CONFIG.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (SECURITY_CONFIG.REQUIRE_NUMBERS && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (SECURITY_CONFIG.REQUIRE_SYMBOLS && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// API Key Management
export class APIKeyService {
  static generateAPIKey(): string {
    const randomBytes = crypto.randomBytes(SECURITY_CONFIG.API_KEY_LENGTH);
    return `${SECURITY_CONFIG.API_KEY_PREFIX}${randomBytes.toString('hex')}`;
  }

  static validateAPIKey(apiKey: string): boolean {
    return apiKey.startsWith(SECURITY_CONFIG.API_KEY_PREFIX) && 
           apiKey.length === SECURITY_CONFIG.API_KEY_PREFIX.length + (SECURITY_CONFIG.API_KEY_LENGTH * 2);
  }
}

// Rate Limiting
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>();

  static checkLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowStart = now - SECURITY_CONFIG.RATE_LIMIT_WINDOW;
    
    // Clean up old entries
    for (const [key, value] of this.requests.entries()) {
      if (value.resetTime < windowStart) {
        this.requests.delete(key);
      }
    }

    const current = this.requests.get(identifier);
    
    if (!current || current.resetTime < windowStart) {
      // New window
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW,
      });
      
      return {
        allowed: true,
        remaining: SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS - 1,
        resetTime: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW,
      };
    }

    if (current.count >= SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
      };
    }

    current.count++;
    return {
      allowed: true,
      remaining: SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS - current.count,
      resetTime: current.resetTime,
    };
  }
}

// Security Headers
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://vercel.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.vercel.com https://vitals.vercel-insights.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; '),
} as const;

// Request Security Validation
export class RequestSecurity {
  static validateRequest(request: NextRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const userAgent = request.headers.get('user-agent');
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');

    // Check for suspicious user agents
    if (userAgent && this.isSuspiciousUserAgent(userAgent)) {
      errors.push('Suspicious user agent detected');
    }

    // Check for suspicious origins
    if (origin && this.isSuspiciousOrigin(origin)) {
      errors.push('Suspicious origin detected');
    }

    // Check for suspicious referers
    if (referer && this.isSuspiciousReferer(referer)) {
      errors.push('Suspicious referer detected');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /php/i,
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  private static isSuspiciousOrigin(origin: string): boolean {
    const suspiciousPatterns = [
      /localhost/i,
      /127\.0\.0\.1/i,
      /0\.0\.0\.0/i,
      /\.tk$/i,
      /\.ml$/i,
      /\.ga$/i,
      /\.cf$/i,
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(origin));
  }

  private static isSuspiciousReferer(referer: string): boolean {
    const suspiciousPatterns = [
      /localhost/i,
      /127\.0\.0\.1/i,
      /0\.0\.0\.0/i,
      /\.tk$/i,
      /\.ml$/i,
      /\.ga$/i,
      /\.cf$/i,
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(referer));
  }
}

// Audit Logging
export class AuditLogger {
  static log(event: string, userId?: string, metadata?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      userId,
      metadata,
      ip: 'unknown', // Will be set by middleware
      userAgent: 'unknown', // Will be set by middleware
    };

    // In production, this would be sent to a secure logging service
    console.log('AUDIT_LOG:', JSON.stringify(logEntry));
  }
}

// Compliance Utilities
export class ComplianceService {
  static generateDataExport(userId: string): any {
    // GDPR/CCPA data export
    return {
      userId,
      timestamp: new Date().toISOString(),
      data: {
        // User data would be fetched from database
        profile: {},
        preferences: {},
        activity: {},
      },
    };
  }

  static deleteUserData(userId: string): boolean {
    // GDPR/CCPA data deletion
    // In production, this would delete all user data from the database
    AuditLogger.log('USER_DATA_DELETED', userId);
    return true;
  }

  static anonymizeUserData(userId: string): boolean {
    // GDPR/CCPA data anonymization
    // In production, this would anonymize all user data
    AuditLogger.log('USER_DATA_ANONYMIZED', userId);
    return true;
  }
}

// Security Middleware
export function withSecurityHeaders(handler: any) {
  return async (request: NextRequest, context: any) => {
    const response = await handler(request, context);
    
    // Add security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  };
}

// All exports are already defined above
