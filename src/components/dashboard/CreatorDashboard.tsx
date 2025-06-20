import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Download, DollarSign, User } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { CreateAgentButton, ViewAgentButton } from './DashboardActions';

interface AgentStats {
  id: string;
  name: string;
  downloads: number;
  revenue: number;
  status: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalAgents: number;
  activeAgents: number;
  totalDownloads: number;
}

export async function CreatorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <Card className="p-6 text-center">
        <p>Please log in to see your dashboard.</p>
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

  const agentStats = agents.map(agent => ({
      ...agent,
      status: 'active', // Simplified
      downloads: 0, // Simplified
      revenue: 0, // Simplified
  }));

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 flex items-center gap-4 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="bg-blue-500 text-white rounded-full p-3"><DollarSign className="w-6 h-6" /></div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-2xl font-bold">${dashboardStats.totalRevenue.toFixed(2)}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <div className="bg-green-500 text-white rounded-full p-3"><Users className="w-6 h-6" /></div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Agents</h3>
            <p className="text-2xl font-bold">{dashboardStats.totalAgents}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="bg-yellow-500 text-white rounded-full p-3"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Active Agents</h3>
            <p className="text-2xl font-bold">{dashboardStats.activeAgents}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="bg-purple-500 text-white rounded-full p-3"><Download className="w-6 h-6" /></div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Downloads</h3>
            <p className="text-2xl font-bold">{dashboardStats.totalDownloads}</p>
          </div>
        </Card>
      </div>

      {/* Agents Table */}
      <Card className="p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-500" /> Your Agents
          </h2>
          <CreateAgentButton />
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-400">No agents found.</TableCell>
                </TableRow>
              ) : (
                agentStats.map((agent, idx) => (
                  <TableRow key={agent.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-blue-50 transition'}>
                    <TableCell className="font-medium text-gray-800 flex items-center gap-2">
                      <span className="inline-block w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {agent.name.charAt(0).toUpperCase()}
                      </span>
                      {agent.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={agent.status === 'active' ? 'success' : 'outline'}>
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{agent.downloads}</TableCell>
                    <TableCell>${agent.revenue.toFixed(2)}</TableCell>
                    <TableCell>
                      <ViewAgentButton agentId={agent.id} />
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