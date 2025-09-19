"use client";

import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Shield, Lock, AlertTriangle, CheckCircle, Key, Eye } from 'lucide-react';

const SecurityDashboard: React.FC = () => {
  const securityMetrics = [
    { label: 'Security Score', value: '98%', icon: Shield, color: 'green' },
    { label: 'Active Threats', value: '0', icon: AlertTriangle, color: 'green' },
    { label: 'Failed Logins', value: '3', icon: Lock, color: 'yellow' },
    { label: 'SSL Status', value: 'Active', icon: CheckCircle, color: 'green' },
  ];

  const recentEvents = [
    { type: 'login', message: 'User login from new location', time: '2 minutes ago', severity: 'medium' },
    { type: 'access', message: 'API key accessed', time: '5 minutes ago', severity: 'low' },
    { type: 'security', message: 'Security scan completed', time: '1 hour ago', severity: 'low' },
    { type: 'alert', message: 'Unusual activity detected', time: '2 hours ago', severity: 'high' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Security Dashboard</h1>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityMetrics.map((metric, index) => (
          <GlassCard key={index} className="text-center">
            <div className={`flex items-center justify-center w-12 h-12 mx-auto rounded-full mb-4 ${
              metric.color === 'green' ? 'bg-green-500/20' : 
              metric.color === 'yellow' ? 'bg-yellow-500/20' : 'bg-red-500/20'
            }`}>
              <metric.icon className={`h-6 w-6 ${
                metric.color === 'green' ? 'text-green-400' : 
                metric.color === 'yellow' ? 'text-yellow-400' : 'text-red-400'
              }`} />
            </div>
            <div className="text-2xl font-bold text-white">{metric.value}</div>
            <div className="text-sm text-white/70">{metric.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Security Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Key className="h-5 w-5 mr-2" />
            Access Control
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Two-Factor Authentication</span>
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">API Rate Limiting</span>
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">IP Whitelisting</span>
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Role-Based Access</span>
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Monitoring
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Real-time Alerts</span>
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Audit Logging</span>
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Intrusion Detection</span>
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Vulnerability Scanning</span>
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Security Events */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-6">Recent Security Events</h3>
        <div className="space-y-4">
          {recentEvents.map((event, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  event.severity === 'high' ? 'bg-red-400' :
                  event.severity === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                }`} />
                <div>
                  <div className="text-white font-medium">{event.message}</div>
                  <div className="text-sm text-white/70 capitalize">{event.type} event</div>
                </div>
              </div>
              <div className="text-xs text-white/50">{event.time}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export { SecurityDashboard };
export default SecurityDashboard;
