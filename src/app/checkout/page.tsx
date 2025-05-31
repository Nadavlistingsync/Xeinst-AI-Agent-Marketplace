import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckoutForm } from '@/components/CheckoutForm';

const planPrices = {
  free: 0,
  basic: 29,
  premium: 99,
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { plan: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?from=/checkout');
  }

  const plan = searchParams.plan?.toLowerCase() || 'free';
  const price = planPrices[plan as keyof typeof planPrices] || 0;

  if (plan === session.user.subscription_tier) {
    redirect('/pricing');
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <CardDescription>
              Upgrade to {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span>Plan</span>
                <span className="font-medium">
                  {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Price</span>
                <span className="font-medium">${price}/month</span>
              </div>
              <div className="border-t pt-6">
                <CheckoutForm plan={plan} price={price} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 