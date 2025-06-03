import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DeploymentsList } from '@/components/dashboard/DeploymentsList';

export const metadata: Metadata = {
  title: 'Dashboard | AI Agency',
  description: 'Manage your AI agent deployments and monitor their performance.',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader user={session.user} />
      <div className="mt-8 space-y-8">
        <DashboardStats userId={session.user.id} />
        <DeploymentsList userId={session.user.id} />
      </div>
    </div>
  );
} 