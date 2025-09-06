"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  stripeConnectId?: string;
  stripeConnectEnabled: boolean;
}

interface Payout {
  id: string;
  amountCredits: number;
  amountUsd: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Earning {
  id: string;
  amount: number;
  createdAt: Date;
  agentId?: string;
}

interface PayoutDashboardProps {
  user: User;
  payouts: Payout[];
  earnings: Earning[];
  totalEarnings: number;
}

export function PayoutDashboard({ user, payouts, earnings, totalEarnings }: PayoutDashboardProps) {
  const [payoutAmount, setPayoutAmount] = useState('');
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);

  const handleConnectStripe = async () => {
    setIsConnectingStripe(true);
    try {
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (response.ok) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to connect Stripe account');
      }
    } catch (error) {
      toast.error('Failed to connect Stripe account');
    } finally {
      setIsConnectingStripe(false);
    }
  };

  const handleRequestPayout = async () => {
    const amount = parseInt(payoutAmount);
    if (!amount || amount < 100) {
      toast.error('Minimum payout amount is 100 credits');
      return;
    }

    if (amount > user.credits) {
      toast.error('Insufficient credits');
      return;
    }

    setIsRequestingPayout(true);
    try {
      const response = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCredits: amount })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Payout request submitted successfully');
        setPayoutAmount('');
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to request payout');
      }
    } catch (error) {
      toast.error('Failed to request payout');
    } finally {
      setIsRequestingPayout(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'requested':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Requested</Badge>;
      case 'processing':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Processing</Badge>;
      case 'paid':
        return <Badge variant="outline" className="text-green-600 border-green-600">Paid</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-600 border-red-600">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'requested':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Available Credits
                </p>
                <p className="text-2xl font-bold text-white">
                  {user.credits.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <CreditCard className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Earnings
                </p>
                <p className="text-2xl font-bold text-white">
                  {totalEarnings.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Stripe Connect
                </p>
                <p className="text-sm font-medium text-white">
                  {user.stripeConnectEnabled ? 'Connected' : 'Not Connected'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <DollarSign className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payouts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="payouts" className="space-y-6">
          {/* Stripe Connect Setup */}
          {!user.stripeConnectEnabled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-blue-500" />
                  Connect Stripe Account
                </CardTitle>
                <CardDescription>
                  Connect your Stripe account to receive payouts from your agent earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    To receive payouts, you need to connect your Stripe account. This allows us to transfer your earnings directly to your bank account.
                  </p>
                  <Button 
                    onClick={handleConnectStripe}
                    disabled={isConnectingStripe}
                    className="w-full"
                  >
                    {isConnectingStripe ? 'Connecting...' : 'Connect Stripe Account'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payout Request */}
          {user.stripeConnectEnabled && (
            <Card>
              <CardHeader>
                <CardTitle>Request Payout</CardTitle>
                <CardDescription>
                  Convert your credits to USD and transfer to your bank account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payout-amount">Credits to Payout</Label>
                  <Input
                    id="payout-amount"
                    type="number"
                    placeholder="Enter credits amount"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    min="100"
                    max={user.credits}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum: 100 credits (${(100 * 0.01).toFixed(2)})
                  </p>
                </div>
                <Button 
                  onClick={handleRequestPayout}
                  disabled={isRequestingPayout || !payoutAmount}
                  className="w-full"
                >
                  {isRequestingPayout ? 'Processing...' : 'Request Payout'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Payout History */}
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>
                Your payout requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payouts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No payout requests yet
                </p>
              ) : (
                <div className="space-y-4">
                  {payouts.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(payout.status)}
                        <div>
                          <p className="font-medium text-white">
                            {payout.amountCredits.toLocaleString()} credits
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${payout.amountUsd.toFixed(2)} USD
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(payout.status)}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(payout.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Earnings History</CardTitle>
              <CardDescription>
                Credits earned from agent usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {earnings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No earnings yet
                </p>
              ) : (
                <div className="space-y-4">
                  {earnings.map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            +{earning.amount.toLocaleString()} credits
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Agent execution earnings
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(earning.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
