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
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import OnboardingGuide from "@/components/OnboardingGuide";

interface UserStats {
  totalAgents: number;
  totalEarnings: number;
  totalUsers: number;
  monthlyEarnings: number;
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
}

export default function SimpleDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    totalAgents: 0,
    totalEarnings: 0,
    totalUsers: 0,
    monthlyEarnings: 0
  });
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      // Check if this is a new user (first time visiting dashboard)
      const isNewUser = localStorage.getItem('isNewUser') === 'true';
      if (isNewUser) {
        setShowOnboarding(true);
        localStorage.removeItem('isNewUser');
      }
      
      fetchUserData();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      // Fetch user stats and agents
      const [statsResponse, agentsResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/agents/user')
      ]);

      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setUserStats(stats);
      }

      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json();
        setAgents(agentsData.agents || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Upload New Agent",
      description: "Connect another AI agent to the marketplace",
      icon: Upload,
      href: "/upload-simple",
      color: "from-blue-500 to-purple-500",
      featured: true
    },
    {
      title: "Buy Credits",
      description: "Purchase credits to use AI agents",
      icon: DollarSign,
      href: "/checkout",
      color: "from-green-500 to-teal-500"
    },
    {
      title: "Browse Marketplace",
      description: "Discover and use AI agents from other creators",
      icon: Bot,
      href: "/marketplace",
      color: "from-orange-500 to-red-500"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ai-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {session?.user?.name || 'Creator'}! 👋
          </h1>
          <p className="text-xl text-muted-foreground">
            Here's how your AI agents are performing
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="border-ai-primary/20 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-blue-400">Total Agents</CardTitle>
                  <Bot className="h-4 w-4 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{userStats.totalAgents}</div>
                <p className="text-xs text-muted-foreground">Active in marketplace</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-ai-primary/20 bg-gradient-to-br from-green-500/10 to-teal-500/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-green-400">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">${userStats.totalEarnings.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">All time earnings</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-ai-primary/20 bg-gradient-to-br from-orange-500/10 to-red-500/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-orange-400">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{userStats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Users served</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-ai-primary/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-purple-400">This Month</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">${userStats.monthlyEarnings.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Monthly earnings</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              >
                <Card 
                  className={`h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40 cursor-pointer ${
                    action.featured ? 'ring-2 ring-ai-primary/20' : ''
                  }`}
                  onClick={() => router.push(action.href)}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-4`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      {action.title}
                      {action.featured && <Badge variant="secondary" className="bg-ai-primary/20 text-ai-primary">Popular</Badge>}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {action.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="w-full border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10"
                    >
                      {action.title}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* My Agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">My Agents</h2>
            <Button 
              onClick={() => router.push('/upload-simple')}
              className="bg-gradient-ai hover:bg-gradient-ai/90 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Agent
            </Button>
          </div>

          {agents.length === 0 ? (
            <Card className="border-ai-primary/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gradient-ai flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No agents yet</h3>
                <p className="text-muted-foreground mb-6">
                  Upload your first AI agent and start earning credits from users worldwide
                </p>
                <Button 
                  onClick={() => router.push('/upload-simple')}
                  className="bg-gradient-ai hover:bg-gradient-ai/90 text-white"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Your First Agent
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                >
                  <Card className="h-full border-ai-primary/20 hover:border-ai-primary/40 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-lg text-white">{agent.name}</CardTitle>
                        <Badge 
                          variant="secondary" 
                          className={
                            agent.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            agent.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }
                        >
                          {agent.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-muted-foreground">
                        {agent.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="text-white">{agent.category}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="text-white">${agent.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Usage:</span>
                          <span className="text-white">{agent.usageCount} times</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Earnings:</span>
                          <span className="text-green-400 font-semibold">${agent.earnings.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Onboarding Guide */}
      <OnboardingGuide 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)}
        userId={session?.user?.id}
      />
    </div>
  );
}
