import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CreatorDashboard } from '@/components/dashboard/CreatorDashboard';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Dashboard | AI Agency',
  description: 'Manage your AI agent deployments and monitor their performance.',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Fetch user credits from DB
  let user = null;
  let userError = null;

  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        credits: true,
      },
    });

    if (!user) {
      userError = 'User not found.';
    }
  } catch (e) {
    userError = 'Failed to load user data.';
  }

  if (userError || !user) {
    return (
      <div className="min-h-screen w-full bg-black flex justify-center items-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-12 border border-white/20 text-center">
          <h1 className="text-3xl font-bold mb-4 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">Dashboard Error</h1>
          <p className="text-white/80 mb-6">{userError}</p>
          <a href="/auth/signin" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Sign In Again</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black flex justify-center items-start">
      <div className="container mx-auto px-4 py-12 max-w-5xl bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl mt-12 mb-12 border border-white/20">
        <h1 className="text-4xl font-bold mb-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] text-center">Dashboard</h1>
        <DashboardHeader user={{
          name: user.name ?? null,
          email: user.email ?? null,
          image: user.image ?? null,
          credits: user.credits ?? 0,
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