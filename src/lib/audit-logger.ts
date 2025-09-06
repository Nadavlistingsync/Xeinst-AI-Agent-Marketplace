import { prisma } from './prisma';

export interface AuditLogData {
  actorId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  meta?: Record<string, any>;
}

export class AuditLogger {
  /**
   * Log an audit event
   */
  static async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          actorId: data.actorId,
          action: data.action,
          targetType: data.targetType,
          targetId: data.targetId,
          meta: data.meta || {}
        }
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw - audit logging should not break the main flow
    }
  }

  /**
   * Log user authentication events
   */
  static async logAuth(action: string, userId?: string, meta?: Record<string, any>): Promise<void> {
    await this.log({
      actorId: userId,
      action: `auth_${action}`,
      targetType: 'user',
      targetId: userId,
      meta
    });
  }

  /**
   * Log agent-related events
   */
  static async logAgent(action: string, agentId: string, actorId?: string, meta?: Record<string, any>): Promise<void> {
    await this.log({
      actorId,
      action: `agent_${action}`,
      targetType: 'agent',
      targetId: agentId,
      meta
    });
  }

  /**
   * Log payment/credit events
   */
  static async logPayment(action: string, userId: string, meta?: Record<string, any>): Promise<void> {
    await this.log({
      actorId: userId,
      action: `payment_${action}`,
      targetType: 'user',
      targetId: userId,
      meta
    });
  }

  /**
   * Log admin actions
   */
  static async logAdmin(action: string, adminId: string, targetType: string, targetId?: string, meta?: Record<string, any>): Promise<void> {
    await this.log({
      actorId: adminId,
      action: `admin_${action}`,
      targetType,
      targetId,
      meta
    });
  }

  /**
   * Log security events
   */
  static async logSecurity(action: string, userId?: string, meta?: Record<string, any>): Promise<void> {
    await this.log({
      actorId: userId,
      action: `security_${action}`,
      targetType: 'system',
      meta
    });
  }

  /**
   * Get audit logs with filtering
   */
  static async getLogs(filters: {
    actorId?: string;
    action?: string;
    targetType?: string;
    targetId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  } = {}) {
    const {
      actorId,
      action,
      targetType,
      targetId,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = filters;

    const whereClause: any = {};

    if (actorId) whereClause.actorId = actorId;
    if (action) whereClause.action = { contains: action };
    if (targetType) whereClause.targetType = targetType;
    if (targetId) whereClause.targetId = targetId;
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        include: {
          actor: {
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
      prisma.auditLog.count({ where: whereClause })
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get audit logs for a specific user
   */
  static async getUserLogs(userId: string, page: number = 1, limit: number = 50) {
    return this.getLogs({
      targetId: userId,
      page,
      limit
    });
  }

  /**
   * Get audit logs for a specific agent
   */
  static async getAgentLogs(agentId: string, page: number = 1, limit: number = 50) {
    return this.getLogs({
      targetType: 'agent',
      targetId: agentId,
      page,
      limit
    });
  }

  /**
   * Get security-related audit logs
   */
  static async getSecurityLogs(page: number = 1, limit: number = 50) {
    return this.getLogs({
      action: 'security_',
      page,
      limit
    });
  }

  /**
   * Get admin action audit logs
   */
  static async getAdminLogs(page: number = 1, limit: number = 50) {
    return this.getLogs({
      action: 'admin_',
      page,
      limit
    });
  }
}
