import { Metadata } from "next";
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from "../../../lib/auth";
import { LiquidCard } from "../../../design-system/components/LiquidCard";
import { LiquidButton } from "../../../design-system/components/LiquidButton";
import { DollarSign, CreditCard, TrendingUp, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: 'Payouts - Dashboard',
  description: 'Manage your earnings and payouts',
};

export default async function PayoutsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Payouts & Earnings
          </h1>
          <p className="text-white/60 mt-2">Track your earnings and manage payouts</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <LiquidCard variant="bubble" size="md" color="green">
            <div className="flex items-center space-x-3 mb-4">
              <DollarSign className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Total Earnings</h3>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">$0.00</div>
            <p className="text-white/60 text-sm">All time earnings</p>
          </LiquidCard>

          <LiquidCard variant="glow" size="md" color="blue">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">This Month</h3>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">$0.00</div>
            <p className="text-white/60 text-sm">Current month earnings</p>
          </LiquidCard>

          <LiquidCard variant="flow" size="md" color="purple">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Pending</h3>
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-2">$0.00</div>
            <p className="text-white/60 text-sm">Awaiting payout</p>
          </LiquidCard>
        </div>

        {/* Coming Soon */}
        <LiquidCard variant="organic" size="lg" color="cyan">
          <div className="text-center py-16">
            <CreditCard className="w-20 h-20 text-cyan-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Payout System Coming Soon
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
              We're building a comprehensive payout system with automatic payments, 
              detailed earnings analytics, and flexible payout options. 
              Stay tuned for the liquid design update!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LiquidButton variant="bubble" color="cyan" leftIcon={<DollarSign className="w-4 h-4" />}>
                Get Notified
              </LiquidButton>
              <LiquidButton variant="ghost" color="cyan">
                Learn More
              </LiquidButton>
            </div>
          </div>
        </LiquidCard>
      </div>
    </div>
  );
}