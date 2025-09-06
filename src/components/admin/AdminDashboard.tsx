"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Bot, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  CheckCircle,
  Eye,
  Settings,
  FileText,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  totalAgents: number;
  totalDisputes: number;
  totalPayouts: number;
  pendingDisputes: number;
  pendingAgents: number;
}

interface AuditLog {
  id: string;
  action: string;
  targetType: string;
  targetId?: string;
  meta?: any;
  createdAt: Date;
  actor?: {
    id: string;
    name: string;
    email: string;
  };
}

interface AdminDashboardProps {
  stats: AdminStats;
  recentAuditLogs: AuditLog[];
}

export function AdminDashboard({ stats, recentAuditLogs }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      href: '/admin/users'
    },
    {
      title: 'Total Agents',
      value: stats.totalAgents.toLocaleString(),
      icon: Bot,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      href: '/admin/agents'
    },
    {
      title: 'Pending Disputes',
      value: stats.pendingDisputes.toLocaleString(),
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      href: '/admin/disputes'
    },
    {
      title: 'Pending Agents',
      value: stats.pendingAgents.toLocaleString(),
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      href: '/admin/agents?status=draft'
    },
    {
      title: 'Total Payouts',
      value: stats.totalPayouts.toLocaleString(),
      icon: DollarSign,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      href: '/admin/payouts'
    },
    {
      title: 'Total Disputes',
      value: stats.totalDisputes.toLocaleString(),
      icon: FileText,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      href: '/admin/disputes'
    }
  ];

  const quickActions = [
    {
      title: 'Moderate Agents',
      description: 'Review and approve pending agents',
      icon: Bot,
      href: '/admin/agents',
      color: 'text-green-500'
    },
    {
      title: 'Resolve Disputes',
      description: 'Handle user disputes and reports',
      icon: AlertTriangle,
      href: '/admin/disputes',
      color: 'text-red-500'
    },
    {
      title: 'View Audit Logs',
      description: 'Monitor system activity and changes',
      icon: Activity,
      href: '/admin/audit-logs',
      color: 'text-blue-500'
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Link key={index} href={stat.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  System Health
                </CardTitle>
                <CardDescription>
                  Current system status and performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Database</span>
                  <Badge variant="default" className="bg-green-500">
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">API Services</span>
                  <Badge variant="default" className="bg-green-500">
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payment System</span>
                  <Badge variant="default" className="bg-green-500">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Agent Execution</span>
                  <Badge variant="default" className="bg-green-500">
                    Running
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Pending Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  Pending Items
                </CardTitle>
                <CardDescription>
                  Items requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Agent Reviews</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{stats.pendingAgents}</span>
                    <Link href="/admin/agents?status=draft">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Disputes</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{stats.pendingDisputes}</span>
                    <Link href="/admin/disputes">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payout Requests</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">0</span>
                    <Link href="/admin/payouts">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                        <action.icon className={`w-6 h-6 ${action.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest system events and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAuditLogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No recent activity
                  </p>
                ) : (
                  recentAuditLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {log.action.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {log.targetType}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {log.actor ? `${log.actor.name} (${log.actor.email})` : 'System'}
                        </p>
                        {log.meta && Object.keys(log.meta).length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {JSON.stringify(log.meta, null, 2).substring(0, 100)}...
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6 text-center">
                <Link href="/admin/audit-logs">
                  <Button variant="outline">
                    View All Activity
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
