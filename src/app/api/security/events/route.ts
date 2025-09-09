import { NextRequest, NextResponse } from 'next/server';
import { AuditLogger } from '@/lib/security';

// GET /api/security/events - Get security events
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real implementation, you would verify the token here
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const severity = searchParams.get('severity');
    const type = searchParams.get('type');

    // Simulate fetching security events from database
    const mockEvents = [
      {
        id: '1',
        type: 'login',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        user: 'admin@xeinst.com',
        ip: '192.168.1.100',
        details: 'Successful login from new device',
        severity: 'low',
        metadata: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: 'New York, NY',
          device: 'Desktop'
        }
      },
      {
        id: '2',
        type: 'security_alert',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        user: 'user@company.com',
        ip: '10.0.0.50',
        details: 'Multiple failed login attempts detected',
        severity: 'high',
        metadata: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          location: 'San Francisco, CA',
          device: 'Mobile',
          failedAttempts: 5
        }
      },
      {
        id: '3',
        type: 'password_change',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        user: 'developer@startup.com',
        ip: '172.16.0.25',
        details: 'Password changed successfully',
        severity: 'low',
        metadata: {
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          location: 'Seattle, WA',
          device: 'Desktop'
        }
      },
      {
        id: '4',
        type: 'data_access',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        user: 'analyst@enterprise.com',
        ip: '203.0.113.42',
        details: 'Bulk data export requested',
        severity: 'medium',
        metadata: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: 'London, UK',
          device: 'Desktop',
          dataSize: '2.5GB',
          recordCount: 15000
        }
      }
    ];

    // Filter events based on query parameters
    let filteredEvents = mockEvents;
    
    if (severity) {
      filteredEvents = filteredEvents.filter(event => event.severity === severity);
    }
    
    if (type) {
      filteredEvents = filteredEvents.filter(event => event.type === type);
    }

    // Apply pagination
    const paginatedEvents = filteredEvents.slice(offset, offset + limit);

    // Log the security event access
    AuditLogger.log('SECURITY_EVENTS_ACCESSED', {
      limit,
      offset,
      severity,
      type,
      resultCount: paginatedEvents.length
    });

    return NextResponse.json({
      success: true,
      events: paginatedEvents,
      pagination: {
        total: filteredEvents.length,
        limit,
        offset,
        hasMore: offset + limit < filteredEvents.length
      }
    });

  } catch (error) {
    console.error('Error fetching security events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security events' },
      { status: 500 }
    );
  }
}

// POST /api/security/events - Create a security event
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, details, severity, metadata } = body;

    // Validate required fields
    if (!type || !details || !severity) {
      return NextResponse.json(
        { error: 'Missing required fields: type, details, severity' },
        { status: 400 }
      );
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(severity)) {
      return NextResponse.json(
        { error: 'Invalid severity. Must be one of: low, medium, high, critical' },
        { status: 400 }
      );
    }

    // Create security event
    const event = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date().toISOString(),
      user: 'system', // In a real implementation, this would be the authenticated user
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      details,
      severity,
      metadata: metadata || {}
    };

    // Log the security event creation
    AuditLogger.log('SECURITY_EVENT_CREATED', undefined, {
      eventId: event.id,
      type,
      severity,
      details
    });

    return NextResponse.json({
      success: true,
      event
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating security event:', error);
    return NextResponse.json(
      { error: 'Failed to create security event' },
      { status: 500 }
    );
  }
}
