"use client";

import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';

export const PayoutDashboard: React.FC = () => {
  const mockPayouts = [
    { id: 1, amount: 125.50, status: 'completed', date: '2024-01-15', method: 'PayPal' },
    { id: 2, amount: 89.25, status: 'pending', date: '2024-01-10', method: 'Bank Transfer' },
    { id: 3, amount: 203.75, status: 'completed', date: '2024-01-05', method: 'Stripe' },
  ];

  return (
    <div className="space-y-6">
      {/* Payout Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-green-500/20 mb-4">
            <DollarSign className="h-6 w-6 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">$1,234.56</div>
          <div className="text-sm text-white/70">Total Earnings</div>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-blue-500/20 mb-4">
            <TrendingUp className="h-6 w-6 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">$456.78</div>
          <div className="text-sm text-white/70">This Month</div>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-purple-500/20 mb-4">
            <Calendar className="h-6 w-6 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">$89.25</div>
          <div className="text-sm text-white/70">Pending</div>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-yellow-500/20 mb-4">
            <CreditCard className="h-6 w-6 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">12</div>
          <div className="text-sm text-white/70">Total Payouts</div>
        </GlassCard>
      </div>

      {/* Recent Payouts */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-6">Recent Payouts</h3>
        <div className="space-y-4">
          {mockPayouts.map((payout) => (
            <div key={payout.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <div className="font-medium text-white">${payout.amount.toFixed(2)}</div>
                  <div className="text-sm text-white/70">{payout.method}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-2 py-1 rounded-full text-xs ${
                  payout.status === 'completed' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {payout.status}
                </div>
                <div className="text-xs text-white/50 mt-1">
                  {new Date(payout.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
