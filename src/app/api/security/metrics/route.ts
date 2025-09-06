import { NextRequest, NextResponse } from 'next/server';
import { AuditLogger } from '@/lib/security';

// GET /api/security/metrics - Get security metrics
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h'; // 24h, 7d, 30d, 90d

    // Simulate fetching security metrics from database
    const mockMetrics = {
      overview: {
        totalUsers: 1247,
        activeUsers: 892,
        failedLogins: 23,
        securityAlerts: 3,
        lastSecurityScan: new Date().toISOString(),
        complianceScore: 94,
        systemStatus: 'secure'
      },
      events: {
        total: 1247,
        byType: {
          login: 892,
          logout: 856,
          password_change: 45,
          security_alert: 3,
          data_access: 12,
          failed_login: 23
        },
        bySeverity: {
          low: 1156,
          medium: 78,
          high: 12,
          critical: 1
        },
        trends: {
          last24h: 156,
          last7d: 1089,
          last30d: 4567,
          last90d: 12456
        }
      },
      compliance: {
        gdpr: {
          status: 'compliant',
          score: 98,
          lastAudit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
          nextAudit: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
        },
        ccpa: {
          status: 'compliant',
          score: 96,
          lastAudit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
          nextAudit: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString()
        },
        soc2: {
          status: 'certified',
          score: 94,
          lastAudit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
          nextAudit: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString()
        },
        hipaa: {
          status: 'not_applicable',
          score: 0,
          lastAudit: null,
          nextAudit: null
        }
      },
      performance: {
        averageResponseTime: 89,
        uptime: 99.99,
        errorRate: 0.01,
        throughput: 1250
      },
      threats: {
        blocked: 1247,
        detected: 23,
        resolved: 20,
        pending: 3,
        byType: {
          ddos: 5,
          brute_force: 12,
          sql_injection: 2,
          xss: 1,
          csrf: 3
        }
      }
    };

    // Log the security metrics access
    AuditLogger.log('SECURITY_METRICS_ACCESSED', undefined, {
      period,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      metrics: mockMetrics,
      period,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching security metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security metrics' },
      { status: 500 }
    );
  }
}
