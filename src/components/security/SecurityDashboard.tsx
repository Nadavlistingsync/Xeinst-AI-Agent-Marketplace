'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Key, 
  Users, 
  Activity,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface SecurityMetrics {
  totalUsers: number;
  activeUsers: number;
  failedLogins: number;
  securityAlerts: number;
  lastSecurityScan: string;
  complianceScore: number;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'password_change' | 'security_alert' | 'data_access';
  timestamp: string;
  user: string;
  ip: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ComplianceStatus {
  gdpr: boolean;
  ccpa: boolean;
  soc2: boolean;
  hipaa: boolean;
  lastAudit: string;
  nextAudit: string;
}

export default function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    failedLogins: 0,
    securityAlerts: 0,
    lastSecurityScan: '',
    complianceScore: 0,
  });

  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [compliance, setCompliance] = useState<ComplianceStatus>({
    gdpr: false,
    ccpa: false,
    soc2: false,
    hipaa: false,
    lastAudit: '',
    nextAudit: '',
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API calls - in production, these would be real API endpoints
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics({
        totalUsers: 1247,
        activeUsers: 892,
        failedLogins: 23,
        securityAlerts: 3,
        lastSecurityScan: new Date().toISOString(),
        complianceScore: 94,
      });

      setEvents([
        {
          id: '1',
          type: 'security_alert',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          user: 'admin@xeinst.com',
          ip: '192.168.1.100',
          details: 'Multiple failed login attempts detected',
          severity: 'high',
        },
        {
          id: '2',
          type: 'login',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          user: 'user@company.com',
          ip: '10.0.0.50',
          details: 'Successful login from new device',
          severity: 'low',
        },
        {
          id: '3',
          type: 'password_change',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          user: 'developer@startup.com',
          ip: '172.16.0.25',
          details: 'Password changed successfully',
          severity: 'low',
        },
      ]);

      setCompliance({
        gdpr: true,
        ccpa: true,
        soc2: true,
        hipaa: false,
        lastAudit: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
        nextAudit: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      });
    } catch (error) {
      console.error('Failed to fetch security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'logout': return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'password_change': return <Key className="h-4 w-4 text-blue-500" />;
      case 'security_alert': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'data_access': return <Eye className="h-4 w-4 text-purple-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage enterprise security measures
          </p>
        </div>
        <Button onClick={fetchSecurityData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeUsers} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.securityAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.failedLogins} failed logins today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.complianceScore}%</div>
            <p className="text-xs text-muted-foreground">
              Last scan: {new Date(metrics.lastSecurityScan).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Secure</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
        </TabsList>

        {/* Security Events */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>
                Monitor all security-related activities and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    {getEventIcon(event.type)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">{event.details}</p>
                        <Badge variant="outline" className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>User: {event.user}</span>
                        <span>IP: {event.ip}</span>
                        <span>{new Date(event.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>
                  Current compliance with industry standards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">GDPR</span>
                  <Badge variant={compliance.gdpr ? "default" : "destructive"}>
                    {compliance.gdpr ? "Compliant" : "Non-compliant"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CCPA</span>
                  <Badge variant={compliance.ccpa ? "default" : "destructive"}>
                    {compliance.ccpa ? "Compliant" : "Non-compliant"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">SOC 2</span>
                  <Badge variant={compliance.soc2 ? "default" : "destructive"}>
                    {compliance.soc2 ? "Compliant" : "Non-compliant"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">HIPAA</span>
                  <Badge variant={compliance.hipaa ? "default" : "destructive"}>
                    {compliance.hipaa ? "Compliant" : "Non-compliant"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audit Schedule</CardTitle>
                <CardDescription>
                  Upcoming security audits and assessments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Last Audit</span>
                    <span>{new Date(compliance.lastAudit).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Next Audit</span>
                    <span>{new Date(compliance.nextAudit).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Audit Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Password Policy</CardTitle>
                <CardDescription>
                  Configure password requirements and policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="minLength">Minimum Length</Label>
                  <Input id="minLength" type="number" defaultValue="12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requireUppercase">Require Uppercase</Label>
                  <Input id="requireUppercase" type="checkbox" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requireNumbers">Require Numbers</Label>
                  <Input id="requireNumbers" type="checkbox" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requireSymbols">Require Symbols</Label>
                  <Input id="requireSymbols" type="checkbox" defaultChecked />
                </div>
                <Button className="w-full">Update Policy</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Management</CardTitle>
                <CardDescription>
                  Configure session timeouts and security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input id="sessionTimeout" type="number" defaultValue="30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxSessions">Max Sessions per User</Label>
                  <Input id="maxSessions" type="number" defaultValue="5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requireMFA">Require MFA</Label>
                  <Input id="requireMFA" type="checkbox" defaultChecked />
                </div>
                <Button className="w-full">Update Settings</Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage user data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export User Data
                </Button>
                <Button variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User Data
                </Button>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Anonymize Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
