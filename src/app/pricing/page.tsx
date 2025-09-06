"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Star, 
  ArrowRight,
  Zap,
  Users,
  Building,
  Crown
} from "lucide-react";
import { motion } from "framer-motion";
// import Link from "next/link";
import { useState } from "react";

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    icon: Zap,
    color: "from-blue-500 to-purple-500",
    features: [
      "1 agent",
      "500 runs/month",
      "Community support",
      "Basic templates",
      "Standard integrations"
    ],
    cta: "Start Free",
    ctaVariant: "outline" as const,
    popular: false
  },
  {
    name: "Pro",
    price: "$49",
    period: "per month",
    description: "For growing teams",
    icon: Star,
    color: "from-green-500 to-teal-500",
    features: [
      "5 agents",
      "50,000 runs/month",
      "Email support",
      "Advanced templates",
      "100+ integrations",
      "Basic analytics",
      "API access"
    ],
    cta: "Start Pro Trial",
    ctaVariant: "default" as const,
    popular: true
  },
  {
    name: "Team",
    price: "$499",
    period: "per month",
    description: "For organizations",
    icon: Users,
    color: "from-orange-500 to-red-500",
    features: [
      "Unlimited agents",
      "500,000 runs/month",
      "Priority support",
      "SSO & RBAC",
      "Shared workspaces",
      "Audit logs",
      "Advanced analytics",
      "Custom integrations"
    ],
    cta: "Contact Sales",
    ctaVariant: "default" as const,
    popular: false
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For large enterprises",
    icon: Building,
    color: "from-purple-500 to-pink-500",
    features: [
      "Unlimited everything",
      "VPC deployment",
      "Private models",
      "SLA guarantees",
      "Dedicated support",
      "Custom compliance",
      "On-premise options",
      "White-label options"
    ],
    cta: "Contact Sales",
    ctaVariant: "default" as const,
    popular: false
  }
];

const faqData = [
  {
    question: "What's included in the free tier?",
    answer: "The free tier includes 1 agent, 500 runs per month, community support, and access to basic templates. Perfect for trying out Xeinst and building your first agent."
  },
  {
    question: "How are runs calculated?",
    answer: "A run is counted each time an agent executes, regardless of the number of steps or tools used. Failed runs due to errors don't count toward your limit."
  },
  {
    question: "Can I change plans anytime?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and for Enterprise customers, we can arrange invoicing with net payment terms."
  },
  {
    question: "Is there a setup fee?",
    answer: "No setup fees for any plan. You only pay the monthly subscription fee. Enterprise customers may have custom implementation costs."
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer: "Yes! Annual billing comes with a 20% discount on Pro and Team plans. Contact us for Enterprise annual pricing."
  }
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark"></div>
        <div className="absolute inset-0 grid-bg opacity-20"></div>
        
        <div className="container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold text-gradient mb-6"
            >
              Simple, Transparent Pricing
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Start free, scale as you grow. No hidden fees, no surprises.
            </motion.p>

            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center justify-center space-x-4 mb-12"
            >
              <span className={`text-sm ${!isAnnual ? 'text-white' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-ai-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-ai-primary focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-ai-primary transition-transform ${
                    isAnnual ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${isAnnual ? 'text-white' : 'text-muted-foreground'}`}>
                Annual
              </span>
              {isAnnual && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                  Save 20%
                </Badge>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-ai text-white border-0">
                      <Crown className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={`h-full hover:shadow-lg transition-all duration-300 ${
                  tier.popular 
                    ? 'border-ai-primary/40 shadow-ai-primary/10' 
                    : 'border-ai-primary/20 hover:border-ai-primary/40'
                }`}>
                  <CardHeader className="text-center">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tier.color} flex items-center justify-center mb-4 mx-auto`}>
                      <tier.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white">{tier.name}</CardTitle>
                    <CardDescription className="text-muted-foreground mb-4">
                      {tier.description}
                    </CardDescription>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">
                        {tier.name === "Enterprise" ? tier.price : isAnnual ? `$${Math.round(parseInt(tier.price.replace('$', '')) * 0.8)}` : tier.price}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {tier.name === "Enterprise" ? "" : isAnnual ? "/year" : tier.period}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-4">
                      <Button 
                        className={`w-full ${
                          tier.popular 
                            ? 'bg-gradient-ai hover:bg-gradient-ai/90' 
                            : tier.ctaVariant === 'outline' 
                              ? 'border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10'
                              : 'bg-ai-primary hover:bg-ai-primary/90'
                        }`}
                        variant={tier.ctaVariant}
                      >
                        {tier.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Everything you need to know about our pricing
            </motion.p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-ai-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">{faq.question}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {faq.answer}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Start building your first agent in minutes. No credit card required.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Zap className="w-5 h-5 mr-2" />
                Start Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <Users className="w-5 h-5 mr-2" />
                Contact Sales
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}