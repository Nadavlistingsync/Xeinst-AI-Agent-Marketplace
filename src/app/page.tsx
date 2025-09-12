"use client"

import React from "react"
import { ArrowRight, Bot, Zap, Users, DollarSign, Sparkles, Star, TrendingUp } from "lucide-react"
import { GlowButton } from "../components/ui/GlowButton"
import { GlassCard } from "../components/ui/GlassCard"
import { motion } from "framer-motion"
import Link from "next/link"

export default function HomePage() {
  // Test function to trigger Sentry error
  const testSentryError = () => {
    // This will trigger an error that Sentry will capture
    // @ts-ignore
    myUndefinedFunction();
  };

  // Auto-trigger test error on page load (uncomment to test)
  // React.useEffect(() => {
  //   myUndefinedFunction();
  // }, []);

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
  ]

  const stats = [
    { number: "1,000+", label: "Active Agents", icon: Bot },
    { number: "50K+", label: "Credits Earned", icon: DollarSign },
    { number: "500+", label: "Happy Creators", icon: Users },
    { number: "99.9%", label: "Uptime", icon: TrendingUp }
  ]

  const howItWorks = [
    {
      step: "01",
      title: "Browse & Discover",
      description: "Explore our marketplace of AI agents. Filter by category, price, and ratings to find the perfect solution."
    },
    {
      step: "02", 
      title: "Purchase Credits",
      description: "Buy credits to use AI agents. Simple, transparent pricing with no hidden fees or subscriptions."
    },
    {
      step: "03",
      title: "Execute & Get Results",
      description: "Run agents instantly via webhooks. Get results in seconds and integrate seamlessly into your workflow."
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-gradient-neon mb-8"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <Bot className="h-10 w-10 text-black" />
            </motion.div>
            
            <motion.h1 
              className="text-hero text-glow-strong font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              The Future of AI is
              <motion.span 
                className="block text-cyan-400"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                Marketplace-Driven
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Connect, create, and monetize AI agents in the world's premier marketplace. 
              From simple automations to complex AI systems, discover the perfect agent for every need.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <GlowButton size="lg" className="group">
                <Link href="/marketplace" className="flex items-center">
                  Explore Marketplace
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </GlowButton>
              <GlowButton variant="glass" size="lg">
                <Link href="/upload">Upload Your Agent</Link>
              </GlowButton>
              <GlowButton 
                variant="neon" 
                size="lg" 
                onClick={testSentryError}
                className="bg-red-500 hover:bg-red-600 border-red-400"
              >
                🧪 Test Sentry Error
              </GlowButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label} 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6 hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-gradient-neon mb-4">
                    <stat.icon className="h-6 w-6 text-black" />
                  </div>
                  <div className="text-3xl font-bold text-glow mb-2">{stat.number}</div>
                  <div className="text-white/70 text-sm">{stat.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-display text-glow-strong font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Get started with AI agents in three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div 
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <GlassCard className="text-center h-full hover:scale-105 transition-transform duration-300 group">
                  <motion.div 
                    className="text-6xl font-bold text-cyan-400 mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {step.step}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-glow mb-4">{step.title}</h3>
                  <p className="text-white/70">{step.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-display text-glow-strong font-bold mb-4">
              Why Choose Xeinst?
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              The most advanced AI agent marketplace with cutting-edge features
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="h-full hover:scale-105 transition-transform duration-300 group">
                  <div className="flex items-start space-x-4">
                    <motion.div 
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-neon flex-shrink-0"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className="h-6 w-6 text-black" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-semibold text-glow mb-2">{feature.title}</h3>
                      <p className="text-white/70">{feature.description}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div 
            className="glass-panel"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-display text-glow-strong font-bold mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p 
              className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Join thousands of developers and creators building the future of AI automation. 
              Start exploring, creating, and monetizing today.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <GlowButton size="lg" className="group">
                <Link href="/marketplace" className="flex items-center">
                  Browse Marketplace
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </GlowButton>
              <GlowButton variant="glass" size="lg">
                <Link href="/upload">Upload Your Agent</Link>
              </GlowButton>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}