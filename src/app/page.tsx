"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  Upload,
  Bot,
  DollarSign,
  Zap,
  CheckCircle,
  Star,
  Play,
  Users,
  TrendingUp,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { Section } from "@/components/ui/Section";

// Core Features
const coreFeatures = [
  {
    icon: Upload,
    title: "Connect Agent",
    description: "Upload your AI agent in 3 simple steps and start earning credits",
    href: "/upload",
    featured: true
  },
  {
    icon: DollarSign,
    title: "Buy Credits",
    description: "Purchase credits to use AI agents on the platform",
    href: "/checkout"
  },
  {
    icon: Bot,
    title: "Use Agents",
    description: "Browse and use AI agents from the marketplace",
    href: "/marketplace"
  }
];

// How It Works Steps
const howItWorksSteps = [
  {
    step: "01",
    title: "Connect Your Agent",
    description: "Connect your AI agent via webhook and set pricing",
    icon: Upload
  },
  {
    step: "02",
    title: "Users Buy Credits",
    description: "Users purchase credits to access your agent",
    icon: DollarSign
  },
  {
    step: "03",
    title: "Earn Money",
    description: "Get paid 80% of each credit spent on your agent",
    icon: TrendingUp
  }
];

// Stats
const stats = [
  { label: "Active Agents", value: "1,234", icon: Bot },
  { label: "Total Credits", value: "50K+", icon: DollarSign },
  { label: "Happy Users", value: "5,678", icon: Users },
  { label: "Success Rate", value: "99.9%", icon: CheckCircle }
];

// Features
const features = [
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with 99.9% uptime guarantee"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Execute agents in milliseconds with our optimized infrastructure"
  },
  {
    icon: TrendingUp,
    title: "Scalable",
    description: "Handle millions of requests with automatic scaling"
  },
  {
    icon: Star,
    title: "Premium Quality",
    description: "Curated agents with quality assurance and performance monitoring"
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section className="pt-32 pb-16">
        <div className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-glow">
              AI Agent
              <br />
              <span className="text-accent">Marketplace</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto">
              Connect your AI agents, sell access with credits, and earn money. 
              The future of AI monetization is here.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <GlowButton size="lg" asChild>
              <Link href="/marketplace">
                Browse Agents
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </GlowButton>
            <GlowButton variant="secondary" size="lg" asChild>
              <Link href="/upload">
                <Upload className="mr-2 h-5 w-5" />
                Connect Agent
              </Link>
            </GlowButton>
          </motion.div>
        </div>
      </Section>

      {/* Core Features */}
      <Section>
        <div className="text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-glow-sm">
              How It Works
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Three simple steps to start earning from your AI agents
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="text-center space-y-4">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-accent/20">
                    <step.icon className="h-8 w-8 text-accent" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-accent">{step.step}</div>
                    <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                    <p className="text-white/70">{step.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Features Grid */}
      <Section>
        <div className="text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-glow-sm">
              Why Choose Xeinst?
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Built for developers, by developers. The most powerful AI agent marketplace.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="text-center space-y-4">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-accent/20">
                    <feature.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-white/70">{feature.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Stats */}
      <Section>
        <div className="text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-glow-sm">
              Trusted by Thousands
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Join the growing community of AI developers and users
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center space-y-2"
              >
                <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-accent/20">
                  <stat.icon className="h-6 w-6 text-accent" />
                </div>
                <div className="text-3xl font-bold text-glow">{stat.value}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <GlassCard className="text-center space-y-8 p-12">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-glow-sm">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Join thousands of developers who are already earning from their AI agents
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GlowButton size="lg" asChild>
                <Link href="/upload">
                  <Upload className="mr-2 h-5 w-5" />
                  Connect Your Agent
                </Link>
              </GlowButton>
              <GlowButton variant="secondary" size="lg" asChild>
                <Link href="/marketplace">
                  <Play className="mr-2 h-5 w-5" />
                  Browse Marketplace
                </Link>
              </GlowButton>
            </div>
          </GlassCard>
        </motion.div>
      </Section>
    </div>
  );
}