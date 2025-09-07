/**
 * Security and Protection Module
 * 
 * This module implements various security measures to protect the codebase
 * from unauthorized use, reverse engineering, and intellectual property theft.
 * 
 * @copyright 2024 AI Agency Website. All rights reserved.
 * @license MIT with additional commercial restrictions
 */

import crypto from 'crypto';

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
      this.validateLicense();
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
    const random = crypto.randomBytes(16).toString('hex');
    return `${WATERMARK_SIGNATURE}_${timestamp}_${random}`;
  }

  /**
   * Validate software license
   */
  private validateLicense(): void {
    const expectedHash = crypto
      .createHash('sha256')
      .update(LICENSE_KEY + WATERMARK_SIGNATURE)
      .digest('hex');
    
    const actualHash = crypto
      .createHash('sha256')
      .update(process.env.LICENSE_KEY || 'invalid' + WATERMARK_SIGNATURE)
      .digest('hex');
    
    if (expectedHash !== actualHash) {
      console.warn('⚠️ License validation failed. This software is protected by copyright.');
      this.reportViolation('LICENSE_VALIDATION_FAILED');
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
  }

  /**
   * Send tracking data to monitoring system
   */
  private async sendTrackingData(data: any): Promise<void> {
    try {
      // In production, this would send to your monitoring endpoint
      console.log('📊 Tracking data:', {
        ...data,
        hash: crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
      });
    } catch (error) {
      console.error('Failed to send tracking data:', error);
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
    
    console.warn('🚨 Security violation detected:', violation);
    
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
      console.log('🚨 Violation report:', violation);
    } catch (error) {
      console.error('Failed to send violation report:', error);
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
  public generateProtectedKey(): string {
    const keyData = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      watermark: WATERMARK_SIGNATURE
    };
    
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(keyData))
      .digest('hex');
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