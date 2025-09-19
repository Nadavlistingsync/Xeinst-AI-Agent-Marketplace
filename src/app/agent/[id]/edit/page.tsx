"use client";

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LiquidCard } from '../../../../design-system/components/LiquidCard';
import { LiquidButton } from '../../../../design-system/components/LiquidButton';
import { Settings, ArrowLeft, Wrench } from 'lucide-react';
import Link from 'next/link';

export default function EditAgentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href={`/agent/${id}`}>
              <LiquidButton variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Agent
              </LiquidButton>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Edit Agent
              </h1>
              <p className="text-white/60 mt-1">Update your agent's configuration</p>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <LiquidCard variant="organic" size="xl" color="blue">
          <div className="text-center py-20">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <Settings className="w-20 h-20 text-blue-400" />
                <Wrench className="w-8 h-8 text-cyan-400 absolute -bottom-2 -right-2" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              Agent Editor Coming Soon
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
              We're building a powerful agent editor with liquid design that will allow you to 
              modify your agent's configuration, update webhook endpoints, adjust pricing, 
              and manage all settings with an intuitive interface.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LiquidButton variant="bubble" color="blue" leftIcon={<Settings className="w-4 h-4" />}>
                Request Early Access
              </LiquidButton>
              <Link href={`/agent/${id}`}>
                <LiquidButton variant="ghost" color="cyan">
                  View Agent Details
                </LiquidButton>
              </Link>
            </div>
          </div>
        </LiquidCard>

        {/* Feature Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <LiquidCard variant="bubble" size="md" color="purple">
            <div className="text-center">
              <Settings className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Configuration</h3>
              <p className="text-white/60 text-sm">Update webhook URLs, secrets, and environment settings</p>
            </div>
          </LiquidCard>

          <LiquidCard variant="glow" size="md" color="cyan">
            <div className="text-center">
              <Wrench className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Pricing</h3>
              <p className="text-white/60 text-sm">Adjust pricing, earnings split, and access levels</p>
            </div>
          </LiquidCard>

          <LiquidCard variant="flow" size="md" color="green">
            <div className="text-center">
              <ArrowLeft className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Deployment</h3>
              <p className="text-white/60 text-sm">Manage deployment status and version control</p>
            </div>
          </LiquidCard>
        </div>
      </div>
    </div>
  );
}