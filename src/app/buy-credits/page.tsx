'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  CreditCard, 
  Check,
  Zap,
  Star,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const creditPackages = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    price: 10,
    popular: false,
    features: ['100 credits', 'Basic support', 'Standard processing']
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 500,
    price: 45,
    popular: true,
    features: ['500 credits', 'Priority support', 'Fast processing', 'Advanced features']
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 1000,
    price: 80,
    popular: false,
    features: ['1000 credits', '24/7 support', 'Instant processing', 'All features', 'Custom integrations']
  }
];

export default function BuyCredits() {
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    if (!session?.user?.id) return;

    setProcessing(packageId);
    
    try {
      const packageData = creditPackages.find(pkg => pkg.id === packageId);
      if (!packageData) return;

      // Create payment intent
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: packageData.price,
          currency: 'usd'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Initialize Stripe
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Confirm payment
      const { error } = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?payment=success`,
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        alert('Payment failed. Please try again.');
      }

    } catch (error) {
      console.error('Purchase error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Buy Credits</h1>
          <p className="text-gray-600 mt-2">Purchase credits to use AI agents</p>
        </div>

        {/* Current Credits */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Current Credits</h3>
                <p className="text-3xl font-bold text-blue-600">{user?.credits || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Available credits</p>
                <p className="text-sm text-gray-500">1 credit = $0.10</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {creditPackages.map((pkg) => (
            <Card key={pkg.id} className={`relative ${pkg.popular ? 'ring-2 ring-blue-500' : ''}`}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-3 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{pkg.credits}</span>
                  <span className="text-lg text-gray-500 ml-2">credits</span>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-blue-600">${pkg.price}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full"
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={processing === pkg.id}
                >
                  {processing === pkg.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Buy Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How Credits Work */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              How Credits Work
            </CardTitle>
            <CardDescription>
              Understanding the credit system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Credit Usage</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Each agent execution costs credits based on complexity</li>
                  <li>• Simple agents: 1-5 credits per execution</li>
                  <li>• Complex agents: 5-20 credits per execution</li>
                  <li>• Credits are deducted only on successful execution</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• No monthly subscriptions required</li>
                  <li>• Pay only for what you use</li>
                  <li>• Credits never expire</li>
                  <li>• Transparent pricing</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
