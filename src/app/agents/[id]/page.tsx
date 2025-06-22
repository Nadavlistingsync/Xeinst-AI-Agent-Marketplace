import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AgentDetails } from '@/components/agents/AgentDetails';
import { FeedbackAnalysis } from '@/components/dashboard/FeedbackAnalysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AgentPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: AgentPageProps): Promise<Metadata> {
  const agent = await prisma.deployment.findUnique({
    where: { publicId: params.id },
  });

  if (!agent) {
    return {
      title: 'Agent Not Found',
    };
  }

  return {
    title: `${agent.name} - Xeinst AI Marketplace`,
    description: agent.description,
  };
}

export default async function AgentPage({ params }: AgentPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    notFound();
  }

  const agent = await prisma.deployment.findUnique({
    where: { publicId: params.id },
    include: {
      creator: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      deployer: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!agent) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Agent Details</TabsTrigger>
          <TabsTrigger value="feedback">Feedback Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <AgentDetails agentId={agent.id} />
        </TabsContent>
        
        <TabsContent value="feedback">
          <FeedbackAnalysis agentId={agent.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 