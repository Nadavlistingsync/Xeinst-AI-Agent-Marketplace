import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AuditLogger } from '@/lib/audit-logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const actorId = searchParams.get('actorId');
    const action = searchParams.get('action');
    const targetType = searchParams.get('targetType');
    const targetId = searchParams.get('targetId');
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await AuditLogger.getLogs({
      actorId: actorId || undefined,
      action: action || undefined,
      targetType: targetType || undefined,
      targetId: targetId || undefined,
      startDate,
      endDate,
      page,
      limit
    });

    return NextResponse.json({
      logs: result.logs.map(log => ({
        id: log.id,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        meta: log.meta,
        createdAt: log.createdAt,
        actor: log.actor ? {
          id: log.actor.id,
          name: log.actor.name,
          email: log.actor.email
        } : null
      })),
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch audit logs' 
    }, { status: 500 });
  }
}
