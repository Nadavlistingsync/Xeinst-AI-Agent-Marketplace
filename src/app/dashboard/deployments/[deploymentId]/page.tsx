import { Metadata } from "next";
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { LiquidCard } from "../../../../design-system/components/LiquidCard";
import { LiquidButton } from "../../../../design-system/components/LiquidButton";
import { Bot, ArrowLeft, Settings, BarChart3 } from "lucide-react";
import Link from "next/link";

interface DeploymentPageProps {
  params: {
    deploymentId: string;
  };
}

export async function generateMetadata({ params }: DeploymentPageProps): Promise<Metadata> {
  const deployment = await prisma.deployment.findUnique({
    where: { id: params.deploymentId },
  });

  if (!deployment) {
    return {
      title: 'Deployment Not Found',
    };
  }

  return {
    title: `${deployment.name} - Deployment Dashboard`,
    description: deployment.description || 'AI Agent Deployment',
  };
}

export default async function DeploymentPage({ params }: DeploymentPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }

  const deployment = await prisma.deployment.findUnique({
    where: { id: params.deploymentId },
    include: {
      metrics: true,
    }
  });

  if (!deployment) {
    redirect("/dashboard");
  }

  if (deployment.deployedBy !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <LiquidButton variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Dashboard
              </LiquidButton>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                {deployment.name}
              </h1>
              <p className="text-white/60 mt-1">{deployment.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              deployment.status === 'active' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : deployment.status === 'pending'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {deployment.status}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deployment Overview */}
          <LiquidCard variant="bubble" size="lg" color="blue">
            <div className="flex items-center space-x-3 mb-6">
              <Bot className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-semibold text-white">Deployment Overview</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-white/60">Environment:</span>
                <span className="text-white font-medium">{deployment.environment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Framework:</span>
                <span className="text-white font-medium">{deployment.framework}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Price:</span>
                <span className="text-white font-medium">{deployment.price || 0} credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Access Level:</span>
                <span className="text-white font-medium capitalize">{deployment.accessLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Created:</span>
                <span className="text-white font-medium">
                  {new Date(deployment.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </LiquidCard>

          {/* Metrics */}
          <LiquidCard variant="glow" size="lg" color="purple">
            <div className="flex items-center space-x-3 mb-6">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Performance Metrics</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-white/60">Total Downloads:</span>
                <span className="text-white font-medium">{deployment.downloadCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Average Rating:</span>
                <span className="text-white font-medium">
                  {deployment.rating ? `${deployment.rating}/5` : 'No ratings yet'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Total Ratings:</span>
                <span className="text-white font-medium">{deployment.totalRatings || 0}</span>
              </div>
            </div>
          </LiquidCard>
        </div>

        {/* Coming Soon */}
        <div className="mt-12">
          <LiquidCard variant="flow" size="lg" color="cyan">
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Advanced Analytics Coming Soon
              </h3>
              <p className="text-white/60 mb-6">
                Detailed metrics, logs, and performance analytics will be available in the liquid design update.
              </p>
              <LiquidButton variant="bubble" color="cyan" leftIcon={<BarChart3 className="w-4 h-4" />}>
                Request Early Access
              </LiquidButton>
            </div>
          </LiquidCard>
        </div>
      </div>
    </div>
  );
}