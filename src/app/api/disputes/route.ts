import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from 'zod';

const createDisputeSchema = z.object({
  targetAgentId: z.string().optional(),
  targetUserId: z.string().optional(),
  reason: z.string().min(10).max(1000),
});

const updateDisputeSchema = z.object({
  disputeId: z.string(),
  status: z.enum(['under_review', 'resolved', 'rejected']),
  resolution: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { targetAgentId, targetUserId, reason } = createDisputeSchema.parse(body);

    // Validate that at least one target is specified
    if (!targetAgentId && !targetUserId) {
      return NextResponse.json({ 
        error: 'Either targetAgentId or targetUserId must be specified' 
      }, { status: 400 });
    }

    // Check if user is trying to dispute themselves
    if (targetUserId === session.user.id) {
      return NextResponse.json({ 
        error: 'You cannot dispute yourself' 
      }, { status: 400 });
    }

    // Check if target agent exists and user is not the creator
    if (targetAgentId) {
      const agent = await prisma.agent.findUnique({
        where: { id: targetAgentId }
      });

      if (!agent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }

      if (agent.createdBy === session.user.id) {
        return NextResponse.json({ 
          error: 'You cannot dispute your own agent' 
        }, { status: 400 });
      }
    }

    // Check if target user exists
    if (targetUserId) {
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId }
      });

      if (!targetUser) {
        return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
      }
    }

    // Create dispute
    const dispute = await prisma.dispute.create({
      data: {
        reporterId: session.user.id,
        targetAgentId,
        targetUserId,
        reason,
        status: 'open'
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        targetAgent: {
          select: {
            id: true,
            name: true,
            createdBy: true
          }
        },
        targetUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log audit action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'dispute_created',
        targetType: 'dispute',
        targetId: dispute.id,
        meta: {
          reason,
          targetAgentId,
          targetUserId
        }
      }
    });

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: 'admin' }
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          type: 'system_alert',
          message: `New dispute reported: ${reason.substring(0, 100)}...`,
          userId: admin.id,
          metadata: {
            disputeId: dispute.id,
            reporterId: session.user.id
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      dispute: {
        id: dispute.id,
        reason: dispute.reason,
        status: dispute.status,
        createdAt: dispute.createdAt,
        targetAgent: dispute.targetAgent,
        targetUser: dispute.targetUser
      }
    });

  } catch (error) {
    console.error('Error creating dispute:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.errors 
      }, { status: 400 });
    }
    return NextResponse.json({ 
      error: 'Failed to create dispute' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause based on user role
    let whereClause: any = {};
    
    if (user.role === 'admin') {
      // Admins can see all disputes
      if (status !== 'all') {
        whereClause.status = status;
      }
    } else {
      // Regular users can only see disputes they reported or are targeted in
      whereClause = {
        OR: [
          { reporterId: session.user.id },
          { targetUserId: session.user.id }
        ]
      };
      
      if (status !== 'all') {
        whereClause.status = status;
      }
    }

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where: whereClause,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          targetAgent: {
            select: {
              id: true,
              name: true,
              createdBy: true
            }
          },
          targetUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.dispute.count({ where: whereClause })
    ]);

    return NextResponse.json({
      disputes: disputes.map(dispute => ({
        id: dispute.id,
        reason: dispute.reason,
        status: dispute.status,
        createdAt: dispute.createdAt,
        updatedAt: dispute.updatedAt,
        reporter: dispute.reporter,
        targetAgent: dispute.targetAgent,
        targetUser: dispute.targetUser
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching disputes:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch disputes' 
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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
    const { disputeId, status, resolution } = updateDisputeSchema.parse(body);

    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId }
    });

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    // Update dispute
    const updatedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: { 
        status,
        updatedAt: new Date()
      }
    });

    // Log audit action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'dispute_updated',
        targetType: 'dispute',
        targetId: disputeId,
        meta: {
          previousStatus: dispute.status,
          newStatus: status,
          resolution
        }
      }
    });

    // Notify involved parties
    const notifications = [];
    
    // Notify reporter
    notifications.push({
      type: 'system_alert',
      message: `Your dispute has been ${status}${resolution ? `: ${resolution}` : ''}`,
      userId: dispute.reporterId,
      metadata: {
        disputeId,
        status,
        resolution
      }
    });

    // Notify target user if applicable
    if (dispute.targetUserId) {
      notifications.push({
        type: 'system_alert',
        message: `A dispute against you has been ${status}${resolution ? `: ${resolution}` : ''}`,
        userId: dispute.targetUserId,
        metadata: {
          disputeId,
          status,
          resolution
        }
      });
    }

    // Notify agent creator if applicable
    if (dispute.targetAgentId) {
      const agent = await prisma.agent.findUnique({
        where: { id: dispute.targetAgentId }
      });
      
      if (agent && agent.createdBy !== dispute.reporterId) {
        notifications.push({
          type: 'system_alert',
          message: `A dispute against your agent has been ${status}${resolution ? `: ${resolution}` : ''}`,
          userId: agent.createdBy,
          metadata: {
            disputeId,
            status,
            resolution
          }
        });
      }
    }

    // Create all notifications
    await prisma.notification.createMany({
      data: notifications
    });

    return NextResponse.json({
      success: true,
      dispute: {
        id: updatedDispute.id,
        status: updatedDispute.status,
        updatedAt: updatedDispute.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating dispute:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.errors 
      }, { status: 400 });
    }
    return NextResponse.json({ 
      error: 'Failed to update dispute' 
    }, { status: 500 });
  }
}
