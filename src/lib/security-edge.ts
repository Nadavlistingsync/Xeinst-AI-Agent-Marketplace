/**
 * Security Edge Module
 * Lightweight security utilities for edge runtime
 */

import { NextRequest } from 'next/server';
import { logger } from './logger';

// Watermarking and tracking
const WATERMARK_SIGNATURE = 'AI_AGENCY_2024';

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
  }

  /**
   * Generate unique session identifier
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 15);
    return `${WATERMARK_SIGNATURE}_${timestamp}_${random}`;
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
   * Validate request integrity
   */
  public validateRequest(request: NextRequest): boolean {
    try {
      // Check for required security headers
      const requiredHeaders = ['user-agent'];
      const hasRequiredHeaders = requiredHeaders.every(header => 
        request.headers.get(header)
      );
      
      if (!hasRequiredHeaders) {
        logger.warn('Missing security headers', { 
          headers: Object.fromEntries(request.headers.entries()) 
        });
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Request validation failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
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

export const validateRequest = (request: NextRequest): boolean => {
  return securityManager.validateRequest(request);
};

export const getSessionInfo = () => {
  return securityManager.getSessionInfo();
};

export default securityManager;
