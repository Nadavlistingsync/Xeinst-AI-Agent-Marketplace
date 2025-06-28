import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiPerformanceTracking } from '@/lib/performance';
import { getPerformanceReport } from '@/lib/performance';

export const GET = withApiPerformanceTracking(async (req: NextRequest) => {
  try {
    const startTime = Date.now();
    const analyticsResults = {
      userStats: {},
      agentStats: {},
      deploymentStats: {},
      performanceStats: {},
      revenueStats: {},
      duration: 0
    };

    // Get user statistics
    const [totalUsers, activeUsers, newUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    analyticsResults.userStats = {
      total: totalUsers,
      active: activeUsers,
      newToday: newUsers,
      activeRate: totalUsers > 0 ? (activeUsers / totalUsers * 100).toFixed(2) : 0
    };

    // Get agent statistics
    const [totalAgents, publicAgents, deployedAgents, agentDownloads] = await Promise.all([
      prisma.agent.count(),
      prisma.agent.count({ where: { isPublic: true } }),
      prisma.agent.count({ where: { status: 'deployed' } }),
      prisma.agent.aggregate({
        _sum: { downloadCount: true }
      })
    ]);

    analyticsResults.agentStats = {
      total: totalAgents,
      public: publicAgents,
      deployed: deployedAgents,
      totalDownloads: agentDownloads._sum.downloadCount || 0,
      deploymentRate: totalAgents > 0 ? (deployedAgents / totalAgents * 100).toFixed(2) : 0
    };

    // Get deployment statistics
    const [totalDeployments, activeDeployments, deploymentRevenue] = await Promise.all([
      prisma.deployment.count(),
      prisma.deployment.count({ where: { status: 'active' } }),
      prisma.deployment.aggregate({
        _sum: { price: true }
      })
    ]);

    analyticsResults.deploymentStats = {
      total: totalDeployments,
      active: activeDeployments,
      totalRevenue: deploymentRevenue._sum.price || 0,
      activeRate: totalDeployments > 0 ? (activeDeployments / totalDeployments * 100).toFixed(2) : 0
    };

    // Get performance statistics
    const performanceReport = getPerformanceReport();
    analyticsResults.performanceStats = {
      averageResponseTime: performanceReport.averageResponseTime,
      successRate: performanceReport.successRate,
      totalOperations: performanceReport.totalOperations,
      recentErrors: performanceReport.recentErrors,
      topOperations: performanceReport.topOperations.slice(0, 5)
    };

    // Get revenue statistics (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [monthlyRevenue, monthlyOrders] = await Promise.all([
      prisma.order.aggregate({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: 'completed'
        },
        _sum: { amount: true }
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: 'completed'
        }
      })
    ]);

    analyticsResults.revenueStats = {
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      monthlyOrders: monthlyOrders,
      averageOrderValue: monthlyOrders > 0 ? (monthlyRevenue._sum.amount || 0) / monthlyOrders : 0
    };

    analyticsResults.duration = Date.now() - startTime;

    // Store analytics data for historical tracking
    await prisma.analyticsSnapshot.create({
      data: {
        timestamp: new Date(),
        data: analyticsResults,
        type: 'system_analytics'
      }
    });

    // Log analytics results
    console.log('Analytics processed:', {
      duration: analyticsResults.duration,
      userCount: analyticsResults.userStats.total,
      agentCount: analyticsResults.agentStats.total,
      deploymentCount: analyticsResults.deploymentStats.total
    });

    return NextResponse.json({
      success: true,
      message: 'Analytics processed successfully',
      results: analyticsResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics job failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Analytics processing failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}); 