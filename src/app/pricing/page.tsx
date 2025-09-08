"use client";

import { GlowButton } from "@/components/ui/GlowButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/ui/PageHeader";
import { 
  CheckCircle, 
  Star, 
  ArrowRight,
  Zap,
  Users,
  Building,
  Crown,
  CreditCard,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    icon: Zap,
    features: [
      "1 agent",
      "500 runs/month",
      "Community support",
      "Basic templates",
      "Standard integrations"
    ],
    cta: "Start Free",
    ctaVariant: "secondary" as const,
    popular: false
  },
  {
    name: "Pro",
    price: "$49",
    period: "per month",
    description: "For growing teams",
    icon: Star,
    features: [
      "5 agents",
      "50,000 runs/month",
      "Email support",
      "Advanced templates",
      "100+ integrations",
      "Priority processing",
      "Analytics dashboard"
    ],
    cta: "Start Pro",
    ctaVariant: "primary" as const,
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For large organizations",
    icon: Building,
    features: [
      "Unlimited agents",
      "Unlimited runs",
      "24/7 phone support",
      "Custom templates",
      "All integrations",
      "Dedicated infrastructure",
      "Advanced analytics",
      "SLA guarantee",
      "Custom integrations"
    ],
    cta: "Contact Sales",
    ctaVariant: "secondary" as const,
    popular: false
  }
];

const creditPackages = [
  {
    name: "Starter Pack",
    credits: 10,
    price: 9.99,
    savings: 0,
    popular: false
  },
  {
    name: "Power Pack",
    credits: 50,
    price: 39.99,
    savings: 10,
    popular: true
  },
  {
    name: "Pro Pack",
    credits: 100,
    price: 69.99,
    savings: 30,
    popular: false
  },
  {
    name: "Enterprise Pack",
    credits: 500,
    price: 299.99,
    savings: 200,
    popular: false
  }
];

const features = [
  {
    icon: CreditCard,
    title: "Flexible Pricing",
    description: "Pay only for what you use with our credit-based system"
  },
  {
    icon: TrendingUp,
    title: "Scale with Growth",
    description: "Start small and scale up as your agent usage grows"
  },
  {
    icon: DollarSign,
    title: "Earn More",
    description: "Higher tiers give you better earnings splits and features"
  }
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Simple, Transparent Pricing"
        subtitle="Choose the plan that fits your needs. Start free and scale as you grow."
      />

      <Section>
        <div className="space-y-16">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center">
            <div className="glass p-1 rounded-xl">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    billingPeriod === 'monthly'
                      ? 'bg-accent text-black'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    billingPeriod === 'yearly'
                      ? 'bg-accent text-black'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Yearly
                  <span className="ml-1 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-accent text-black px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <GlassCard className={`p-8 h-full ${tier.popular ? 'ring-2 ring-accent' : ''}`}>
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-accent/20 mb-4">
                      <tier.icon className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                    <p className="text-white/70 mb-4">{tier.description}</p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-glow">{tier.price}</span>
                      <span className="text-white/70 ml-2">/{tier.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                        <span className="text-white/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <GlowButton
                    variant={tier.ctaVariant}
                    fullWidth
                    size="lg"
                  >
                    {tier.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </GlowButton>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Credit Packages */}
          <div className="text-center space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-glow-sm mb-4">Credit Packages</h2>
              <p className="text-white/70 max-w-2xl mx-auto">
                Buy credits to use AI agents on the platform. Credits never expire and can be used across all agents.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {creditPackages.map((pkg, index) => (
                <motion.div
                  key={pkg.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-accent text-black px-3 py-1 rounded-full text-xs font-medium">
                        Best Value
                      </div>
                    </div>
                  )}
                  
                  <GlassCard className={`p-6 text-center ${pkg.popular ? 'ring-2 ring-accent' : ''}`}>
                    <h3 className="text-lg font-semibold text-white mb-2">{pkg.name}</h3>
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-glow">{pkg.credits}</div>
                      <div className="text-sm text-white/70">credits</div>
                    </div>
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-accent">${pkg.price}</div>
                      {pkg.savings > 0 && (
                        <div className="text-sm text-green-400">
                          Save ${pkg.savings}
                        </div>
                      )}
                    </div>
                    <GlowButton
                      variant={pkg.popular ? "primary" : "secondary"}
                      fullWidth
                      size="sm"
                    >
                      Buy Now
                    </GlowButton>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <GlassCard className="text-center p-6">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-accent/20 mb-4">
                    <feature.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/70 text-sm">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-glow-sm mb-8 text-center">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">How do credits work?</h3>
                <p className="text-white/70 text-sm">
                  Credits are used to execute AI agents. Each agent has a fixed cost per execution. 
                  Credits never expire and can be used across all agents on the platform.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Can I change plans anytime?</h3>
                <p className="text-white/70 text-sm">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately 
                  and we'll prorate any billing differences.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">What happens to unused credits?</h3>
                <p className="text-white/70 text-sm">
                  Credits never expire and remain in your account until used. You can always purchase 
                  more credits or use existing ones across any agent.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Is there a free trial?</h3>
                <p className="text-white/70 text-sm">
                  Yes! The Free plan includes 500 runs per month to get you started. 
                  No credit card required to begin.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </Section>
    </div>
  );
}