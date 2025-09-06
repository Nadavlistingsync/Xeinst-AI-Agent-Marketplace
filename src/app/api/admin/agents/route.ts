import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const agentModerationSchema = z.object({
  agentId: z.string(),
  action: z.enum(['approve', 'suspend', 'reject']),
  reason: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const whereClause = status === 'all' ? {} : { status };

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where: whereClause,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          webhookLogs: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          },
          disputes: {
            where: { status: 'open' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.agent.count({ where: whereClause })
    ]);

    return NextResponse.json({
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        category: agent.category,
        price: agent.price,
        status: agent.status,
        isPublic: agent.isPublic,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
        creator: agent.creator,
        webhookLogs: agent.webhookLogs,
        disputeCount: agent.disputes.length,
        downloadCount: agent.downloadCount
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching agents for moderation:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch agents' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { agentId, action, reason } = agentModerationSchema.parse(body);

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { creator: true }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    let newStatus: string;
    switch (action) {
      case 'approve':
        newStatus = 'active';
        break;
      case 'suspend':
        newStatus = 'suspended';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update agent status
    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: { 
        status: newStatus,
        isPublic: action === 'approve'
      }
    });

    // Log audit action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: `agent_${action}`,
        targetType: 'agent',
        targetId: agentId,
        meta: {
          reason,
          previousStatus: agent.status,
          newStatus,
          agentName: agent.name,
          creatorId: agent.createdBy
        }
      }
    });

    // Create notification for agent creator
    await prisma.notification.create({
      data: {
        type: 'system_alert',
        message: `Your agent "${agent.name}" has been ${action}d${reason ? `: ${reason}` : ''}`,
        userId: agent.createdBy,
        metadata: {
          agentId: agent.id,
          action,
          reason
        }
      }
    });

    return NextResponse.json({
      success: true,
      agent: {
        id: updatedAgent.id,
        name: updatedAgent.name,
        status: updatedAgent.status,
        isPublic: updatedAgent.isPublic
      }
    });

  } catch (error) {
    console.error('Error moderating agent:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.errors 
      }, { status: 400 });
    }
    return NextResponse.json({ 
      error: 'Failed to moderate agent' 
    }, { status: 500 });
  }
}
