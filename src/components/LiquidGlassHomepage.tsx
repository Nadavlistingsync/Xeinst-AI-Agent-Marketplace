'use client';

import React from "react";
import { ArrowRight, Bot, Zap, Users, DollarSign, Sparkles, Star, TrendingUp } from "lucide-react";
import { LiquidGlassCard, LiquidGlassButton, LiquidGlassHero } from "./ui/liquid-glass";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LiquidGlassHomepage() {
  const features = [
    {
      icon: Bot,
      title: "AI Agent Marketplace",
      description: "Discover and deploy powerful AI agents created by the community. From content generation to data analysis, find the perfect agent for your needs."
    },
    {
      icon: Zap,
      title: "Instant Deployment",
      description: "Deploy agents in seconds with our webhook-based system. No complex setup required - just connect and start using immediately."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join thousands of developers and creators building the future of AI automation. Share your agents and earn from your innovations."
    },
    {
      icon: DollarSign,
      title: "Monetize Your Work",
      description: "Turn your AI agents into revenue streams. Set your own pricing and earn credits every time someone uses your creation."
    }
  ];

  const stats = [
    { number: "1,000+", label: "Active Agents", icon: Bot },
    { number: "50K+", label: "Credits Earned", icon: DollarSign },
    { number: "500+", label: "Happy Creators", icon: Users },
    { number: "99.9%", label: "Uptime", icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <LiquidGlassHero
        title="AI Agent Marketplace"
        subtitle="Discover, deploy, and monetize AI agents. Join the future of automation."
        ctaText="Start Building"
        ctaHref="/upload-super-easy"
        className="mb-20"
      />

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="liquid-grid">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <LiquidGlassCard variant="glow" className="text-center p-8">
                <stat.icon className="h-12 w-12 mx-auto mb-4 text-white/80" />
                <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-white/70">{stat.label}</div>
              </LiquidGlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Why Choose Our Marketplace?</h2>
          <p className="text-xl text-white/70">Built for creators, by creators</p>
        </div>
        
        <div className="liquid-grid">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <LiquidGlassCard variant="elevated" className="p-8">
                <feature.icon className="h-12 w-12 mb-6 text-white/80" />
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </LiquidGlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="container mx-auto px-6 py-16">
        <LiquidGlassCard variant="glow" className="text-center p-12">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-white/70 mb-8">
            Join thousands of creators building the future of AI automation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LiquidGlassButton variant="primary" size="lg" asChild>
              <Link href="/upload-super-easy">
                Upload Your Agent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </LiquidGlassButton>
            <LiquidGlassButton variant="secondary" size="lg" asChild>
              <Link href="/marketplace">
                Browse Marketplace
                <Sparkles className="ml-2 h-5 w-5" />
              </Link>
            </LiquidGlassButton>
          </div>
        </LiquidGlassCard>
      </section>
    </div>
  );
}
