import { Metadata } from 'next';
import { CreatorDashboard } from '@/components/dashboard/CreatorDashboard';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Creator Dashboard - Xeinst',
  description: 'Manage your AI agents and track your revenue',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/dashboard');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Creator Dashboard</h1>
        <CreatorDashboard />
      </div>
    </div>
  );
} 