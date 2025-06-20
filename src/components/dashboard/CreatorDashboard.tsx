"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
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
import { DashboardHeader } from './DashboardHeader';

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

interface User {
  name: string | null;
  email: string | null;
  image: string | null;
  credits: number;
}

export function CreatorDashboard({ user }: { user: User }) {
  const { toast } = useToast();
  const [agents, setAgents] = useState<AgentStats[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalAgents: 0,
    activeAgents: 0,
    totalDownloads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [buying, setBuying] = useState(false);
  const [buyAmount, setBuyAmount] = useState(100);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [agentsResponse, statsResponse] = await Promise.all([
        fetch('/api/agents?creator=true'),
        fetch('/api/agents/stats'),
      ]);

      if (!agentsResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [agentsData, statsData] = await Promise.all([
        agentsResponse.json(),
        statsResponse.json(),
      ]);

      setAgents(agentsData.agents);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({ description: 'Failed to load dashboard data. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
    const openModal = () => setShowBuyCredits(true);
    window.addEventListener('openBuyCreditsModal', openModal);
    return () => window.removeEventListener('openBuyCreditsModal', openModal);
  }, [fetchDashboardData]);

  const handleBuyCredits = async () => {
    setBuying(true);
    try {
      const res = await fetch('/api/credits/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits: buyAmount }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({ description: data.error || 'Failed to start checkout', variant: 'destructive' });
      }
    } catch (err) {
      toast({ description: 'Failed to start checkout', variant: 'destructive' });
    } finally {
      setBuying(false);
      setShowBuyCredits(false);
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Buy Credits Modal */}
      {showBuyCredits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Buy Credits</h2>
            <label className="block mb-2 font-medium">How many credits?</label>
            <input
              type="number"
              min={100}
              step={100}
              value={buyAmount}
              onChange={e => setBuyAmount(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <div className="flex justify-between items-center">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowBuyCredits(false)}
                disabled={buying}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleBuyCredits}
                disabled={buying}
              >
                {buying ? 'Redirecting...' : `Buy for $${(buyAmount / 100).toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 flex items-center gap-4 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="bg-blue-500 text-white rounded-full p-3"><DollarSign className="w-6 h-6" /></div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <div className="bg-green-500 text-white rounded-full p-3"><Users className="w-6 h-6" /></div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Agents</h3>
            <p className="text-2xl font-bold">{stats.totalAgents}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="bg-yellow-500 text-white rounded-full p-3"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Active Agents</h3>
            <p className="text-2xl font-bold">{stats.activeAgents}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="bg-purple-500 text-white rounded-full p-3"><Download className="w-6 h-6" /></div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Downloads</h3>
            <p className="text-2xl font-bold">{stats.totalDownloads}</p>
          </div>
        </Card>
      </div>

      {/* Agents Table */}
      <Card className="p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-500" /> Your Agents
          </h2>
          <Button
            onClick={() => window.location.href = '/agent-builder'}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-purple-600 transition"
            size="lg"
          >
            + Create New Agent
          </Button>
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
              {agents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-400">No agents found.</TableCell>
                </TableRow>
              ) : (
                agents.map((agent, idx) => (
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-blue-100 hover:text-blue-700 transition"
                        onClick={() => window.location.href = `/agent/${agent.id}`}
                      >
                        View
                      </Button>
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