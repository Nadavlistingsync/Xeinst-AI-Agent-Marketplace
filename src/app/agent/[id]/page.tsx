import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MonitoringDashboard } from '@/components/dashboard/MonitoringDashboard';
import { AgentPage } from '@/components/agent/AgentPage';
import prisma from '@/lib/prisma';

interface AgentPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: AgentPageProps): Promise<Metadata> {
  const agent = await prisma.deployment.findUnique({
    where: { id: params.id },
  });

  if (!agent) {
    return {
      title: 'Agent Not Found',
    };
  }

  return {
    title: `${agent.name} - Xeinst`,
    description: agent.description,
  };
}

export default async function Page({ params }: AgentPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login?callbackUrl=/agent/' + params.id);
  }

  const agent = await prisma.deployment.findUnique({
    where: { id: params.id },
    include: {
      users: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!agent) {
    redirect('/404');
  }

  // Check if user has access to the agent
  if (
    agent.deployedBy !== session.user.id &&
    agent.accessLevel !== 'public' &&
    ((agent.accessLevel === 'premium' && session.user.subscriptionTier !== 'premium') ||
     (agent.accessLevel === 'basic' && session.user.subscriptionTier !== 'basic'))
  ) {
    redirect('/403');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <AgentPage agentId={params.id} />
        {agent.deployedBy === session.user.id && (
          <MonitoringDashboard agentId={params.id} />
        )}
      </div>
    </div>
  );
} 