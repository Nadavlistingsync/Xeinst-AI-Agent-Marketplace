import { Metadata } from 'next';
import { AgentBuilder } from '@/components/agent-builder/AgentBuilder';
import { Card } from '@/components/ui/card';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/button';

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
        <a href="/replit-embed" target="_blank" rel="noopener noreferrer">
          <Button className="mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-purple-600 transition w-full">
            Open Replit IDE (New Tab)
          </Button>
        </a>
        <Card className="p-6">
          <AgentBuilder />
        </Card>
      </div>
    </div>
  );
} 