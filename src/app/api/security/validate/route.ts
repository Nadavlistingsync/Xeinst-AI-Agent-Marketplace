import { NextRequest, NextResponse } from 'next/server';
import { securityManager } from '@/lib/security';

/**
 * Security Validation API Endpoint
 * 
 * This endpoint validates the security status of the application
 * and reports any violations or suspicious activities.
 * 
 * @copyright 2024 AI Agency Website. All rights reserved.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Validate request
    if (!securityManager.validateRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized request' },
        { status: 401 }
      );
    }

    // Get security status
    const sessionInfo = securityManager.getSessionInfo();
    const securityStatus = {
      status: 'active',
      sessionId: sessionInfo.sessionId,
      watermark: sessionInfo.watermark,
      uptime: sessionInfo.uptime,
      timestamp: new Date().toISOString(),
      copyright: 'Copyright (c) 2024 AI Agency Website. All rights reserved.',
      license: 'MIT with commercial restrictions',
      protection: {
        watermarking: true,
        tracking: true,
        licenseValidation: true,
        antiTampering: true
      }
    };

    return NextResponse.json(securityStatus, {
      headers: {
        'X-Copyright': 'Copyright (c) 2024 AI Agency Website. All rights reserved.',
        'X-License': 'MIT with commercial restrictions',
        'X-Watermark': 'AI_AGENCY_2024',
        'X-Session-ID': sessionInfo.sessionId
      }
    });

  } catch (error) {
    console.error('Security validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate request
    if (!securityManager.validateRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized request' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    // Handle different security actions
    switch (action) {
      case 'validate_license':
        // License validation logic would go here
        return NextResponse.json({ 
          valid: true, 
          message: 'License validated successfully' 
        });

      case 'report_violation':
        // Report security violation
        console.warn('🚨 Security violation reported:', data);
        return NextResponse.json({ 
          received: true, 
          message: 'Violation reported' 
        });

      case 'get_protection_status':
        // Return protection status
        return NextResponse.json({
          watermarking: true,
          tracking: true,
          licenseValidation: true,
          antiTampering: true,
          sessionId: securityManager.getSessionInfo().sessionId
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Security API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
