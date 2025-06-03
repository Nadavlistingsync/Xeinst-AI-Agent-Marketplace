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
      <DashboardHeader user={{
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }} />
      <div className="mt-8 space-y-8">
        <DashboardStats />
        {/* Fetch deployments and pass as prop to DeploymentsList */}
        {/* <DeploymentsList deployments={deployments} /> */}
      </div>
    </div>
  );
} 