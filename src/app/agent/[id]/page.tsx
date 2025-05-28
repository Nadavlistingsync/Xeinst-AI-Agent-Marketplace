import { Metadata } from 'next';
import { AgentPage } from '@/components/agent/AgentPage';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';

interface AgentPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: AgentPageProps): Promise<Metadata> {
  const agent = await prisma.deployment.findUnique({
    where: { id: params.id },
    select: { name: true, description: true },
  });

  if (!agent) {
    return {
      title: 'Agent Not Found - Xeinst',
    };
  }

  return {
    title: `${agent.name} - Xeinst`,
    description: agent.description,
  };
}

export default async function AgentPageRoute({ params }: AgentPageProps) {
  const agent = await prisma.deployment.findUnique({
    where: { id: params.id },
  });

  if (!agent) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <AgentPage agentId={params.id} />
      </div>
    </div>
  );
} 