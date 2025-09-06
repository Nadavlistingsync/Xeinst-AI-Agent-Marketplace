import { NextRequest } from 'next/server';
import { RateLimiter, RequestSecurity, AuditLogger } from '@/lib/security';

// Security testing utilities for enterprise validation
export class SecurityTesting {
  
  // Test rate limiting
  static async testRateLimiting(identifier: string, requests: number = 150): Promise<{
    passed: boolean;
    results: Array<{ request: number; allowed: boolean; remaining: number }>;
    summary: string;
  }> {
    const results = [];
    let blockedAt = -1;
    
    for (let i = 1; i <= requests; i++) {
      const result = RateLimiter.checkLimit(identifier);
      results.push({
        request: i,
        allowed: result.allowed,
        remaining: result.remaining
      });
      
      if (!result.allowed && blockedAt === -1) {
        blockedAt = i;
      }
    }
    
    const passed = blockedAt > 0 && blockedAt <= 110; // Should block around 100 requests
    
    return {
      passed,
      results,
      summary: passed 
        ? `Rate limiting working correctly. Blocked at request ${blockedAt}`
        : `Rate limiting failed. Expected to block around request 100, but blocked at ${blockedAt}`
    };
  }
  
  // Test request security validation
  static async testRequestSecurity(): Promise<{
    passed: boolean;
    results: Array<{ test: string; passed: boolean; details: string }>;
    summary: string;
  }> {
    const results = [];
    
    // Test 1: Normal request
    const normalRequest = new NextRequest('https://xeinst.com/api/test', {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'origin': 'https://xeinst.com'
      }
    });
    
    const normalResult = RequestSecurity.validateRequest(normalRequest);
    results.push({
      test: 'Normal Request',
      passed: normalResult.isValid,
      details: normalResult.isValid ? 'Request validated successfully' : `Errors: ${normalResult.errors.join(', ')}`
    });
    
    // Test 2: Suspicious user agent
    const suspiciousRequest = new NextRequest('https://xeinst.com/api/test', {
      headers: {
        'user-agent': 'curl/7.68.0',
        'origin': 'https://xeinst.com'
      }
    });
    
    const suspiciousResult = RequestSecurity.validateRequest(suspiciousRequest);
    results.push({
      test: 'Suspicious User Agent',
      passed: !suspiciousResult.isValid,
      details: suspiciousResult.isValid ? 'Should have been blocked' : `Correctly blocked: ${suspiciousResult.errors.join(', ')}`
    });
    
    // Test 3: Suspicious origin
    const originRequest = new NextRequest('https://xeinst.com/api/test', {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'origin': 'http://localhost:3000'
      }
    });
    
    const originResult = RequestSecurity.validateRequest(originRequest);
    results.push({
      test: 'Suspicious Origin',
      passed: !originResult.isValid,
      details: originResult.isValid ? 'Should have been blocked' : `Correctly blocked: ${originResult.errors.join(', ')}`
    });
    
    const passed = results.every(r => r.passed);
    
    return {
      passed,
      results,
      summary: passed 
        ? 'All request security tests passed'
        : 'Some request security tests failed'
    };
  }
  
  // Test audit logging
  static async testAuditLogging(): Promise<{
    passed: boolean;
    results: Array<{ test: string; passed: boolean; details: string }>;
    summary: string;
  }> {
    const results = [];
    
    // Test 1: Basic logging
    try {
      AuditLogger.log('TEST_EVENT', 'test-user', { test: true });
      results.push({
        test: 'Basic Logging',
        passed: true,
        details: 'Audit log created successfully'
      });
    } catch (error) {
      results.push({
        test: 'Basic Logging',
        passed: false,
        details: `Failed to create audit log: ${error}`
      });
    }
    
    // Test 2: Logging with metadata
    try {
      AuditLogger.log('TEST_EVENT_WITH_METADATA', 'test-user', { 
        test: true, 
        metadata: { key: 'value' },
        timestamp: new Date().toISOString()
      });
      results.push({
        test: 'Logging with Metadata',
        passed: true,
        details: 'Audit log with metadata created successfully'
      });
    } catch (error) {
      results.push({
        test: 'Logging with Metadata',
        passed: false,
        details: `Failed to create audit log with metadata: ${error}`
      });
    }
    
    const passed = results.every(r => r.passed);
    
    return {
      passed,
      results,
      summary: passed 
        ? 'All audit logging tests passed'
        : 'Some audit logging tests failed'
    };
  }
  
  // Test password policy
  static async testPasswordPolicy(): Promise<{
    passed: boolean;
    results: Array<{ test: string; passed: boolean; details: string }>;
    summary: string;
  }> {
    const results = [];
    
    // Test 1: Valid password
    const validPassword = 'SecurePassword123!';
    const validResult = this.validatePassword(validPassword);
    results.push({
      test: 'Valid Password',
      passed: validResult.isValid,
      details: validResult.isValid ? 'Password meets all requirements' : `Errors: ${validResult.errors.join(', ')}`
    });
    
    // Test 2: Short password
    const shortPassword = 'short';
    const shortResult = this.validatePassword(shortPassword);
    results.push({
      test: 'Short Password',
      passed: !shortResult.isValid,
      details: shortResult.isValid ? 'Should have been rejected' : `Correctly rejected: ${shortResult.errors.join(', ')}`
    });
    
    // Test 3: Password without uppercase
    const noUpperPassword = 'securepassword123!';
    const noUpperResult = this.validatePassword(noUpperPassword);
    results.push({
      test: 'Password without Uppercase',
      passed: !noUpperResult.isValid,
      details: noUpperResult.isValid ? 'Should have been rejected' : `Correctly rejected: ${noUpperResult.errors.join(', ')}`
    });
    
    // Test 4: Password without numbers
    const noNumberPassword = 'SecurePassword!';
    const noNumberResult = this.validatePassword(noNumberPassword);
    results.push({
      test: 'Password without Numbers',
      passed: !noNumberResult.isValid,
      details: noNumberResult.isValid ? 'Should have been rejected' : `Correctly rejected: ${noNumberResult.errors.join(', ')}`
    });
    
    // Test 5: Password without symbols
    const noSymbolPassword = 'SecurePassword123';
    const noSymbolResult = this.validatePassword(noSymbolPassword);
    results.push({
      test: 'Password without Symbols',
      passed: !noSymbolResult.isValid,
      details: noSymbolResult.isValid ? 'Should have been rejected' : `Correctly rejected: ${noSymbolResult.errors.join(', ')}`
    });
    
    const passed = results.every(r => r.passed);
    
    return {
      passed,
      results,
      summary: passed 
        ? 'All password policy tests passed'
        : 'Some password policy tests failed'
    };
  }
  
  // Helper method to validate password (simplified version)
  private static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Run all security tests
  static async runAllTests(): Promise<{
    passed: boolean;
    results: {
      rateLimiting: any;
      requestSecurity: any;
      auditLogging: any;
      passwordPolicy: any;
    };
    summary: string;
  }> {
    const results = {
      rateLimiting: await this.testRateLimiting('test-identifier'),
      requestSecurity: await this.testRequestSecurity(),
      auditLogging: await this.testAuditLogging(),
      passwordPolicy: await this.testPasswordPolicy()
    };
    
    const allPassed = Object.values(results).every(r => r.passed);
    
    return {
      passed: allPassed,
      results,
      summary: allPassed 
        ? 'All security tests passed successfully'
        : 'Some security tests failed. Review the results for details.'
    };
  }
}

// Export the security testing utilities
export default SecurityTesting;
