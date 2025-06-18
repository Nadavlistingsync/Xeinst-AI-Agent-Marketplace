import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CreatorDashboard } from '@/components/dashboard/CreatorDashboard';

export const metadata: Metadata = {
  title: 'Dashboard | AI Agency',
  description: 'Manage your AI agent deployments and monitor their performance.',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Fetch user credits from API
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const res = await fetch(baseUrl + '/api/user/me', {
    headers: { Cookie: '' }, // Pass cookies if needed for auth
    cache: 'no-store',
  });
  const userData = res.ok ? await res.json() : { credits: 0 };

  return (
    <div className="min-h-screen w-full bg-black flex justify-center items-start">
      <div className="container mx-auto px-4 py-12 max-w-5xl bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl mt-12 mb-12 border border-white/20">
        <h1 className="text-4xl font-bold mb-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] text-center">Dashboard</h1>
        <DashboardHeader user={{
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          image: session.user.image ?? null,
          credits: userData.credits ?? 0,
        }} />
        <div className="mt-8 space-y-8">
          <CreatorDashboard />
          {/* Fetch deployments and pass as prop to DeploymentsList */}
          {/* <DeploymentsList deployments={deployments} /> */}
        </div>
      </div>
    </div>
  );
} 