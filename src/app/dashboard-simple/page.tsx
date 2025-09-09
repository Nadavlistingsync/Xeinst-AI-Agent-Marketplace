"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Upload, 
  ArrowRight, 
  Plus, 
  DollarSign, 
  Users, 
  TrendingUp,
  Bot,
  CheckCircle,
  Clock,
  Star,
  Zap,
  CreditCard,
  Activity,
  BarChart3
} from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/ui/PageHeader";

interface UserStats {
  totalAgents: number;
  totalEarnings: number;
  totalUsers: number;
  monthlyEarnings: number;
  credits: number;
  creditsUsed: number;
  creditsPurchased: number;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  status: 'active' | 'pending' | 'inactive';
  usageCount: number;
  earnings: number;
  createdAt: string;
  totalRuns: number;
  _count: {
    executions: number;
    reviews: number;
    purchases: number;
  };
}

interface RecentExecution {
  id: string;
  agentId: string;
  agentName: string;
  status: string;
  cost: number;
  createdAt: string;
}

export default function SimpleDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats>({
    totalAgents: 0,
    totalEarnings: 0,
    totalUsers: 0,
    monthlyEarnings: 0,
    credits: 0,
    creditsUsed: 0,
    creditsPurchased: 0
  });
  const [agents, setAgents] = useState<Agent[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<RecentExecution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/dashboard');
      if (response.ok) {
        const data = await response.json();
        setUserStats(data.user);
        setAgents(data.agents || []);
        setRecentExecutions(data.recentExecutions || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${session?.user?.name || session?.user?.email}`}
        actions={
          <GlowButton asChild>
            <a href="/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Agent
            </a>
          </GlowButton>
        }
      />

      <Section>
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <GlassCard className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-accent/20 mb-4">
                  <CreditCard className="h-6 w-6 text-accent" />
                </div>
                <div className="text-2xl font-bold text-glow">{userStats.credits}</div>
                <div className="text-sm text-white/70">Credits Available</div>
                <div className="text-xs text-white/50 mt-1">
                  {userStats.creditsUsed} used • {userStats.creditsPurchased} purchased
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <GlassCard className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-accent/20 mb-4">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
                <div className="text-2xl font-bold text-glow">${userStats.totalEarnings.toFixed(2)}</div>
                <div className="text-sm text-white/70">Total Earnings</div>
                <div className="text-xs text-white/50 mt-1">
                  ${userStats.monthlyEarnings.toFixed(2)} this month
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <GlassCard className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-accent/20 mb-4">
                  <Bot className="h-6 w-6 text-accent" />
                </div>
                <div className="text-2xl font-bold text-glow">{userStats.totalAgents}</div>
                <div className="text-sm text-white/70">Active Agents</div>
                <div className="text-xs text-white/50 mt-1">
                  {agents.filter(a => a.status === 'active').length} live
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <GlassCard className="text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-accent/20 mb-4">
                  <Activity className="h-6 w-6 text-accent" />
                </div>
                <div className="text-2xl font-bold text-glow">
                  {agents.reduce((sum, agent) => sum + agent.totalRuns, 0)}
                </div>
                <div className="text-sm text-white/70">Total Runs</div>
                <div className="text-xs text-white/50 mt-1">
                  Across all agents
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlowButton variant="glass" fullWidth asChild>
                  <a href="/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Agent
                  </a>
                </GlowButton>
                <GlowButton variant="glass" fullWidth asChild>
                  <a href="/marketplace">
                    <Bot className="mr-2 h-4 w-4" />
                    Browse Agents
                  </a>
                </GlowButton>
                <GlowButton variant="glass" fullWidth asChild>
                  <a href="/credits/purchase">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Buy Credits
                  </a>
                </GlowButton>
              </div>
            </GlassCard>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* My Agents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">My Agents</h3>
                  <GlowButton size="sm" asChild>
                    <a href="/upload">
                      <Plus className="h-4 w-4" />
                    </a>
                  </GlowButton>
                </div>
                
                {agents.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 text-white/50 mx-auto mb-4" />
                    <h4 className="text-white font-medium mb-2">No agents yet</h4>
                    <p className="text-white/70 text-sm mb-4">
                      Upload your first AI agent to start earning credits
                    </p>
                    <GlowButton asChild>
                      <a href="/upload">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Agent
                      </a>
                    </GlowButton>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {agents.slice(0, 5).map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{agent.name}</h4>
                            <div className="flex items-center space-x-2 text-sm text-white/70">
                              <span className="capitalize">{agent.category}</span>
                              <span>•</span>
                              <span>{agent.price} credits</span>
                              <span>•</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                agent.status === 'active' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : agent.status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {agent.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-white">${agent.earnings.toFixed(2)}</div>
                          <div className="text-xs text-white/50">{agent.totalRuns} runs</div>
                        </div>
                      </div>
                    ))}
                    {agents.length > 5 && (
                      <GlowButton variant="glass" fullWidth asChild>
                        <a href="/dashboard/uploads">
                          View All Agents
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </GlowButton>
                    )}
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                  <GlowButton size="sm" variant="glass" asChild>
                    <a href="/dashboard/purchases">
                      View All
                    </a>
                  </GlowButton>
                </div>
                
                {recentExecutions.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-white/50 mx-auto mb-4" />
                    <h4 className="text-white font-medium mb-2">No recent activity</h4>
                    <p className="text-white/70 text-sm">
                      Your agent usage and earnings will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentExecutions.slice(0, 5).map((execution) => (
                      <div key={execution.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                            <Zap className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{execution.agentName}</h4>
                            <div className="flex items-center space-x-2 text-sm text-white/70">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                execution.status === 'completed' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : execution.status === 'processing'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {execution.status}
                              </span>
                              <span>•</span>
                              <span>{new Date(execution.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-white">{execution.cost} credits</div>
                          <div className="text-xs text-white/50">used</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </div>

          {/* Earnings Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-6">Earnings Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-glow">${userStats.totalEarnings.toFixed(2)}</div>
                  <div className="text-sm text-white/70">Total Earnings</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-glow">${userStats.monthlyEarnings.toFixed(2)}</div>
                  <div className="text-sm text-white/70">This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-glow">
                    {userStats.totalEarnings > 0 ? ((userStats.monthlyEarnings / userStats.totalEarnings) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-white/70">Monthly Growth</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </Section>
    </div>
  );
}