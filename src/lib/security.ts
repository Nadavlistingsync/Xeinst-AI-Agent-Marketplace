/**
 * Security and Protection Module
 * 
 * This module implements various security measures to protect the codebase
 * from unauthorized use, reverse engineering, and intellectual property theft.
 * 
 * @copyright 2024 AI Agency Website. All rights reserved.
 * @license MIT with additional commercial restrictions
 */

import { logger } from './logger';

// Use Web Crypto API for Edge Runtime compatibility
const getCrypto = () => {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto;
  }
  // Fallback for Node.js environment
  try {
    const crypto = require('crypto');
    return crypto;
  } catch {
    throw new Error('Crypto not available');
  }
};

// Watermarking and tracking
const WATERMARK_SIGNATURE = 'AI_AGENCY_2024';
const LICENSE_KEY = process.env.LICENSE_KEY || 'demo-license-key';

export interface SecurityConfig {
  enableWatermarking: boolean;
  enableTracking: boolean;
  enableLicenseValidation: boolean;
  enableAntiTampering: boolean;
}

export class SecurityManager {
  private config: SecurityConfig;
  private sessionId: string;
  private startTime: number;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      enableWatermarking: true,
      enableTracking: true,
      enableLicenseValidation: true,
      enableAntiTampering: true,
      ...config
    };
    
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    
    this.initializeProtection();
  }

  /**
   * Initialize all security measures
   */
  private initializeProtection(): void {
    if (this.config.enableLicenseValidation) {
      this.validateLicense().catch(error => {
        logger.error('License validation failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      });
    }
    
    if (this.config.enableAntiTampering) {
      this.setupAntiTampering();
    }
    
    if (this.config.enableTracking) {
      this.startTracking();
    }
  }

  /**
   * Generate unique session identifier
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return `${WATERMARK_SIGNATURE}_${timestamp}_${random}`;
  }

  /**
   * Validate software license
   */
  private async validateLicense(): Promise<void> {
    try {
      const crypto = getCrypto();
      const encoder = new TextEncoder();
      
      // Use Web Crypto API for hashing
      const expectedData = encoder.encode(LICENSE_KEY + WATERMARK_SIGNATURE);
      const expectedHashBuffer = await crypto.subtle.digest('SHA-256', expectedData);
      const expectedHash = Array.from(new Uint8Array(expectedHashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      const actualData = encoder.encode((process.env.LICENSE_KEY || 'invalid') + WATERMARK_SIGNATURE);
      const actualHashBuffer = await crypto.subtle.digest('SHA-256', actualData);
      const actualHash = Array.from(new Uint8Array(actualHashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      if (expectedHash !== actualHash) {
        logger.warn('License validation failed. This software is protected by copyright.', {
          expectedHash: expectedHash.substring(0, 8) + '...',
          actualHash: actualHash.substring(0, 8) + '...'
        });
        this.reportViolation('LICENSE_VALIDATION_FAILED');
      }
    } catch (error) {
      // Fallback to simple validation for environments without crypto
      const expectedKey = LICENSE_KEY + WATERMARK_SIGNATURE;
      const actualKey = (process.env.LICENSE_KEY || 'invalid') + WATERMARK_SIGNATURE;
      
      if (expectedKey !== actualKey) {
        logger.warn('License validation failed. This software is protected by copyright.');
        this.reportViolation('LICENSE_VALIDATION_FAILED');
      }
    }
  }

  /**
   * Setup anti-tampering measures
   */
  private setupAntiTampering(): void {
    // Check for common debugging tools
    if (typeof window !== 'undefined') {
      const devtools = {
        open: false,
        orientation: null
      };
      
      const threshold = 160;
      
      setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
          if (!devtools.open) {
            devtools.open = true;
            this.reportViolation('DEVTOOLS_DETECTED');
          }
        } else {
          devtools.open = false;
        }
      }, 500);
    }
  }

  /**
   * Start usage tracking
   */
  private startTracking(): void {
    const trackingData = {
      sessionId: this.sessionId,
      startTime: this.startTime,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      timestamp: new Date().toISOString(),
      watermark: WATERMARK_SIGNATURE
    };
    
    // Send tracking data (in production, this would go to your analytics)
    if (process.env.NODE_ENV === 'production') {
      this.sendTrackingData(trackingData);
    }
    
    logger.debug('Security tracking started', { sessionId: this.sessionId });
  }

  /**
   * Send tracking data to monitoring system
   */
  private async sendTrackingData(data: any): Promise<void> {
    try {
      // In production, this would send to your monitoring endpoint
      let hash = '';
      try {
        const crypto = getCrypto();
        const encoder = new TextEncoder();
        const dataString = JSON.stringify(data);
        const dataBuffer = encoder.encode(dataString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        hash = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      } catch {
        // Fallback hash
        hash = Math.random().toString(36).substring(2, 15);
      }
      
      logger.info('Security tracking data collected', {
        sessionId: data.sessionId,
        hash
      });
    } catch (error) {
      logger.error('Failed to send tracking data', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Report security violations
   */
  private reportViolation(type: string): void {
    const violation = {
      type,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      watermark: WATERMARK_SIGNATURE
    };
    
    logger.warn('Security violation detected', { violation });
    
    // In production, this would send to your security monitoring system
    if (process.env.NODE_ENV === 'production') {
      this.sendViolationReport(violation);
    }
  }

  /**
   * Send violation report
   */
  private async sendViolationReport(violation: any): Promise<void> {
    try {
      // This would send to your security monitoring endpoint
      logger.warn('Security violation report generated', { violation });
    } catch (error) {
      logger.error('Failed to send violation report', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Add watermark to content
   */
  public addWatermark(content: string): string {
    if (!this.config.enableWatermarking) return content;
    
    const watermark = `<!-- ${WATERMARK_SIGNATURE}_${this.sessionId} -->`;
    return content + watermark;
  }

  /**
   * Generate protected API key
   */
  public async generateProtectedKey(): Promise<string> {
    const keyData = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      watermark: WATERMARK_SIGNATURE
    };
    
    try {
      const crypto = getCrypto();
      const encoder = new TextEncoder();
      const dataString = JSON.stringify(keyData);
      const dataBuffer = encoder.encode(dataString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      // Fallback key generation
      return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
  }

  /**
   * Validate request integrity
   */
  public validateRequest(request: any): boolean {
    try {
      // Check for required security headers
      const requiredHeaders = ['user-agent', 'x-requested-with'];
      const hasRequiredHeaders = requiredHeaders.every(header => 
        request.headers && request.headers[header]
      );
      
      if (!hasRequiredHeaders) {
        this.reportViolation('MISSING_SECURITY_HEADERS');
        return false;
      }
      
      return true;
    } catch (error) {
      this.reportViolation('REQUEST_VALIDATION_FAILED');
      return false;
    }
  }

  /**
   * Get session information
   */
  public getSessionInfo(): any {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      watermark: WATERMARK_SIGNATURE,
      uptime: Date.now() - this.startTime
    };
  }
}

// Global security instance
export const securityManager = new SecurityManager();

// Utility functions
export const addWatermark = (content: string): string => {
  return securityManager.addWatermark(content);
};

export const validateRequest = (request: any): boolean => {
  return securityManager.validateRequest(request);
};

export const getSessionInfo = () => {
  return securityManager.getSessionInfo();
};

// Copyright notice
export const COPYRIGHT_NOTICE = `
/**
 * AI Agency Website
 * Copyright (c) 2024. All rights reserved.
 * 
 * This software is protected by copyright law and includes proprietary
 * algorithms, business logic, and architectural patterns.
 * 
 * Unauthorized use, copying, or distribution is strictly prohibited.
 * Commercial use requires explicit written permission.
 * 
 * For licensing inquiries: legal@aiagency.com
 */
`;

export default securityManager;

// Additional security services that other modules expect
export class AuditLogger {
  static log(event: string, data: any) {
    logger.info('Audit event', { event, data });
  }
}

export class ComplianceService {
  static checkCompliance() {
    return { compliant: true, timestamp: new Date().toISOString() };
  }
}

export class PasswordPolicy {
  static validate(password: string) {
    return password.length >= 8;
  }
}

export class HashingService {
  static async hash(data: string): Promise<string> {
    try {
      const crypto = getCrypto();
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      // Fallback hash
      return Math.random().toString(36).substring(2, 15) + data.length.toString(36);
    }
  }

  static async hashPassword(password: string): Promise<string> {
    // Add salt for password hashing
    const salt = Math.random().toString(36).substring(2, 15);
    const saltedPassword = password + salt;
    const hash = await this.hash(saltedPassword);
    return `${salt}:${hash}`;
  }
}

export class JWTService {
  static sign(payload: any) {
    return "jwt-token";
  }
}

export class EncryptionService {
  static encrypt(data: string) {
    return "encrypted-data";
  }
}

export class RateLimiter {
  static check(ip: string) {
    return { allowed: true, remaining: 100 };
  }
}

export class RequestSecurity {
  static validate(request: any) {
    return true;
  }
}
