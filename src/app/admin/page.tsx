import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Xeinst',
  description: 'Admin dashboard for managing the AI Agent marketplace',
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get admin statistics
  const [
    totalUsers,
    totalAgents,
    totalDisputes,
    totalPayouts,
    recentAuditLogs,
    pendingDisputes,
    pendingAgents
  ] = await Promise.all([
    prisma.user.count(),
    prisma.agent.count(),
    prisma.dispute.count(),
    prisma.payout.count(),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    }),
    prisma.dispute.count({ where: { status: 'open' } }),
    prisma.agent.count({ where: { status: 'draft' } })
  ]);

  const stats = {
    totalUsers,
    totalAgents,
    totalDisputes,
    totalPayouts,
    pendingDisputes,
    pendingAgents
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, agents, disputes, and system settings
          </p>
        </div>

        <AdminDashboard 
          stats={stats}
          recentAuditLogs={recentAuditLogs}
        />
      </div>
    </div>
  );
}
