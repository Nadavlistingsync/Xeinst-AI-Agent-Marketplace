import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiPerformanceTracking } from '@/lib/performance';
import { getPerformanceReport } from '@/lib/performance';

export const GET = withApiPerformanceTracking(async (_req: NextRequest) => {
  try {
    // Check if we're in build mode or database is not available and return mock data
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL || 
        process.env.NEXT_PHASE === 'phase-production-build' ||
        !process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        message: 'Analytics skipped during build - database not available',
        results: {
          userStats: { total: 0, active: 0, newToday: 0, activeRate: '0' },
          agentStats: { total: 0, public: 0, deployed: 0, totalDownloads: 0, deploymentRate: '0' },
          deploymentStats: { total: 0, active: 0, totalRevenue: 0, activeRate: '0' },
          performanceStats: {},
          revenueStats: { monthlyRevenue: 0, monthlyOrders: 0, averageOrderValue: 0 },
          duration: 0
        },
        timestamp: new Date().toISOString()
      });
    }

    const startTime = Date.now();
    const analyticsResults: {
      userStats: { total: number; active: number; newToday: number; activeRate: string };
      agentStats: { total: number; public: number; deployed: number; totalDownloads: number; deploymentRate: string };
      deploymentStats: { total: number; active: number; totalRevenue: number; activeRate: string };
      performanceStats: any;
      revenueStats: { monthlyRevenue: number; monthlyOrders: number; averageOrderValue: number };
      duration: number;
    } = {
      userStats: { total: 0, active: 0, newToday: 0, activeRate: '0' },
      agentStats: { total: 0, public: 0, deployed: 0, totalDownloads: 0, deploymentRate: '0' },
      deploymentStats: { total: 0, active: 0, totalRevenue: 0, activeRate: '0' },
      performanceStats: {},
      revenueStats: { monthlyRevenue: 0, monthlyOrders: 0, averageOrderValue: 0 },
      duration: 0
    };

    // Get user statistics
    const [totalUsers, activeUsers, newUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
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
      activeRate: totalUsers > 0 ? (activeUsers / totalUsers * 100).toFixed(2) : '0'
    };

    // Get agent statistics
    const [totalAgents, publicAgents, deployedAgents, agentDownloads] = await Promise.all([
      prisma.agent.count(),
      prisma.agent.count({ where: { isPublic: true } }),
      prisma.agent.count({ where: { isPublic: true } }),
      prisma.agent.aggregate({
        _sum: { downloadCount: true }
      })
    ]);

    analyticsResults.agentStats = {
      total: totalAgents,
      public: publicAgents,
      deployed: deployedAgents,
      totalDownloads: (agentDownloads._sum?.downloadCount as number) || 0,
      deploymentRate: totalAgents > 0 ? (deployedAgents / totalAgents * 100).toFixed(2) : '0'
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
      totalRevenue: deploymentRevenue._sum?.price || 0,
      activeRate: totalDeployments > 0 ? (activeDeployments / totalDeployments * 100).toFixed(2) : '0'
    };

    // Get performance statistics
    const performanceReport = getPerformanceReport();
    analyticsResults.performanceStats = {
      averageResponseTime: performanceReport?.averageResponseTime || 0,
      successRate: performanceReport?.successRate || 100,
      totalOperations: performanceReport?.totalOperations || 0,
      recentErrors: performanceReport?.recentErrors || [],
      topOperations: performanceReport?.topOperations?.slice(0, 5) || []
    };

    // Get revenue statistics (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [monthlyRevenue, monthlyOrders] = await Promise.all([
      prisma.purchase.aggregate({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: 'completed'
        },
        _sum: { amount: true }
      }),
      prisma.purchase.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: 'completed'
        }
      })
    ]);

    analyticsResults.revenueStats = {
      monthlyRevenue: monthlyRevenue._sum?.amount || 0,
      monthlyOrders: monthlyOrders,
      averageOrderValue: monthlyOrders > 0 ? (monthlyRevenue._sum?.amount || 0) / monthlyOrders : 0
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