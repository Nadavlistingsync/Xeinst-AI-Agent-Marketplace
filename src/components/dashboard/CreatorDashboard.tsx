import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Download, DollarSign, User, Plus, Eye, Edit, Activity, Zap } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { CreateAgentButton, ViewAgentButton, EditAgentButton } from './DashboardActions';

interface AgentStats {
  id: string;
  name: string;
  status: string;
  downloads: number;
  revenue: number;
}

export async function CreatorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <Card className="p-8 text-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-400" />
        </div>
        <p className="text-white/80">Please log in to see your dashboard.</p>
      </Card>
    );
  }

  const userId = session.user.id;

  const agents = await prisma.agent.findMany({
    where: { createdBy: userId },
    select: {
      id: true,
      name: true,
    },
  });

  const agentCount = await prisma.agent.count({
    where: { createdBy: userId },
  });

  // These are simplified stats.
  // We can add more complex queries later.
  const dashboardStats = {
    totalRevenue: 0,
    totalAgents: agentCount,
    activeAgents: agentCount, // Simplified
    totalDownloads: 0, // Simplified
  };

  const agentStats: AgentStats[] = agents.map((agent: { id: string; name: string }) => ({
      ...agent,
      status: 'active', // Simplified
      downloads: 0, // Simplified
      revenue: 0, // Simplified
  }));

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl hover:scale-105 transition-all duration-300 group dashboard-card interactive-element">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/70">Total Revenue</h3>
              <p className="text-2xl font-bold text-white">${dashboardStats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl border border-green-500/30 rounded-2xl hover:scale-105 transition-all duration-300 group dashboard-card interactive-element">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/70">Total Agents</h3>
              <p className="text-2xl font-bold text-white">{dashboardStats.totalAgents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-xl border border-yellow-500/30 rounded-2xl hover:scale-105 transition-all duration-300 group dashboard-card interactive-element">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/70">Active Agents</h3>
              <p className="text-2xl font-bold text-white">{dashboardStats.activeAgents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl hover:scale-105 transition-all duration-300 group dashboard-card interactive-element">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/70">Total Downloads</h3>
              <p className="text-2xl font-bold text-white">{dashboardStats.totalDownloads}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl dashboard-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-400" />
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-3 text-white font-medium interactive-element">
            <Plus className="w-5 h-5" />
            Create New Agent
          </button>
          <button className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-3 text-white font-medium interactive-element">
            <Eye className="w-5 h-5" />
            View Marketplace
          </button>
          <button className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-3 text-white font-medium interactive-element">
            <TrendingUp className="w-5 h-5" />
            View Analytics
          </button>
        </div>
      </Card>

      {/* Agents Table */}
      <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl dashboard-table">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <User className="w-6 h-6 text-blue-400" />
            Your Agents
          </h2>
          <CreateAgentButton />
        </div>

        <div className="overflow-hidden rounded-xl border border-white/20 dashboard-scrollbar">
          <Table className="min-w-full">
            <TableHeader className="bg-white/10">
              <TableRow className="border-white/20">
                <TableHead className="text-white/80 font-semibold">Name</TableHead>
                <TableHead className="text-white/80 font-semibold">Status</TableHead>
                <TableHead className="text-white/80 font-semibold">Downloads</TableHead>
                <TableHead className="text-white/80 font-semibold">Revenue</TableHead>
                <TableHead className="text-white/80 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white/50" />
                      </div>
                      <div>
                        <p className="text-white/60 text-lg font-medium">No agents found</p>
                        <p className="text-white/40 text-sm">Create your first AI agent to get started</p>
                      </div>
                      <CreateAgentButton />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                agentStats.map((agent: AgentStats, idx: number) => (
                  <TableRow key={agent.id} className="border-white/10 hover:bg-white/5 transition-colors duration-200">
                    <TableCell className="font-medium text-white flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                        {agent.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white">{agent.name}</span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`${
                          agent.status === 'active' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        } border`}
                      >
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white">{agent.downloads}</TableCell>
                    <TableCell className="text-white">${agent.revenue.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <ViewAgentButton agentId={agent.id} />
                        <EditAgentButton agentId={agent.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
} 