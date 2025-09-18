import { NextRequest, NextResponse } from 'next/server';
import SecurityTesting from '../../../../lib/security-testing';
import { AuditLogger } from "../../../../lib/security";

// GET /api/security/test - Run security tests
export async function GET(request: NextRequest) {
  try {
    // Get query parameters first
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'all';
    
    // Check authentication - allow health check without auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Return basic status for health checks
      if (testType === 'health') {
        return NextResponse.json({ 
          status: 'Security API is running',
          timestamp: new Date().toISOString()
        }, { status: 200 });
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let testResults;

    switch (testType) {
      case 'rate-limiting':
        testResults = await SecurityTesting.testRateLimiting('test-identifier');
        break;
      case 'request-security':
        testResults = await SecurityTesting.testRequestSecurity();
        break;
      case 'audit-logging':
        testResults = await SecurityTesting.testAuditLogging();
        break;
      case 'password-policy':
        testResults = await SecurityTesting.testPasswordPolicy();
        break;
      case 'all':
      default:
        testResults = await SecurityTesting.runAllTests();
        break;
    }

    // Log the security test execution
    AuditLogger.log('SECURITY_TESTS_EXECUTED', {
      testType,
      passed: testResults.passed,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      testType,
      results: testResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error running security tests:', error);
    return NextResponse.json(
      { error: 'Failed to run security tests' },
      { status: 500 }
    );
  }
}

// POST /api/security/test - Run custom security test
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { testType, parameters } = body;

    if (!testType) {
      return NextResponse.json(
        { error: 'Test type is required' },
        { status: 400 }
      );
    }

    let testResults;

    switch (testType) {
      case 'rate-limiting':
        const identifier = parameters?.identifier || 'test-identifier';
        const requests = parameters?.requests || 150;
        testResults = await SecurityTesting.testRateLimiting(identifier, requests);
        break;
      case 'request-security':
        testResults = await SecurityTesting.testRequestSecurity();
        break;
      case 'audit-logging':
        testResults = await SecurityTesting.testAuditLogging();
        break;
      case 'password-policy':
        testResults = await SecurityTesting.testPasswordPolicy();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid test type' },
          { status: 400 }
        );
    }

    // Log the custom security test execution
    AuditLogger.log('CUSTOM_SECURITY_TEST_EXECUTED', {
      testType,
      parameters,
      passed: testResults.passed,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      testType,
      parameters,
      results: testResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error running custom security test:', error);
    return NextResponse.json(
      { error: 'Failed to run custom security test' },
      { status: 500 }
    );
  }
}
