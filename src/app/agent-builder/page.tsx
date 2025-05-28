import { Metadata } from 'next';
import { AgentBuilder } from '@/components/agent-builder/AgentBuilder';
import { Card } from '@/components/ui/card';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Agent Builder - Xeinst',
  description: 'Build and deploy your AI agents',
};

export default async function AgentBuilderPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/agent-builder');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Agent Builder</h1>
        <Card className="p-6">
          <AgentBuilder />
        </Card>
      </div>
    </div>
  );
} 