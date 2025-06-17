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
        <Card className="p-6 mb-8">
          <AgentBuilder />
        </Card>
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Coding Playground</h2>
          <p className="text-gray-600 mb-4 max-w-2xl">Use the embedded Replit IDE below to write, run, and experiment with code directly in your browser. This is powered by <a href=\"https://replit.com/\" target=\"_blank\" rel=\"noopener noreferrer\" className=\"underline text-blue-500 hover:text-blue-700\">Replit</a> and supports AI code generation and instant feedback. No need to leave the site!</p>
          <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-500 bg-black mx-auto">
            <iframe
              src="https://replit.com/@replit/Python?embed=true"
              title="Replit IDE Embed"
              width="100%"
              height="600"
              frameBorder="0"
              allowFullScreen
              className="w-full min-h-[600px] bg-black"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
} 