import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PricingCard from '@/components/PricingCard';

const pricingPlans = [
  {
    name: 'Free',
    price: '0',
    description: 'Basic features for individuals',
    features: [
      '1 active deployment',
      'Basic analytics',
      'Community support'
    ],
    buttonText: 'Get Started',
    buttonVariant: 'default' as const,
    current: false,
  },
  {
    name: 'Basic',
    price: '$29',
    description: 'For growing businesses',
    features: [
      'Everything in Free',
      'Up to 10 agents',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
    ],
    buttonText: 'Upgrade to Basic',
    buttonVariant: 'default',
    current: false,
  },
  {
    name: 'Premium',
    price: '$99',
    description: 'For serious businesses',
    features: [
      'Everything in Basic',
      'Unlimited agents',
      '24/7 support',
      'Advanced analytics',
      'Custom branding',
      'API access',
      'White-label solution',
    ],
    buttonText: 'Upgrade to Premium',
    buttonVariant: 'default',
    current: false,
  },
];

export default async function PricingPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?from=/pricing');
  }

  // Update current plan based on user's subscription
  const updatedPlans = pricingPlans.map(plan => ({
    ...plan,
    current: plan.name.toLowerCase() === session.user.subscriptionTier,
  }));

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that's right for you
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {updatedPlans.map((plan) => (
          <PricingCard
            key={plan.name}
            name={plan.name}
            price={plan.price}
            description={plan.description}
            features={plan.features}
            buttonText={plan.buttonText}
            buttonVariant={plan.buttonVariant as 'default' | 'outline'}
            current={plan.current}
          />
        ))}
      </div>
    </div>
  );
} 