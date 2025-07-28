"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Search, 
  Upload, 
  Rocket, 
  Globe, 
  Bot, 
  Settings, 
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Zap,
  Users,
  Shield,
  TrendingUp,
  BookOpen,
  Cloud,
  Database
} from "lucide-react";

const gettingStartedSteps = [
  {
    step: "1",
    icon: Search,
    title: "Browse the Marketplace",
    description: "Explore our collection of pre-built AI agents. Find agents for data analysis, content creation, customer service, and more.",
    action: "Browse Marketplace",
    href: "/marketplace",
    color: "from-blue-500 to-purple-500"
  },
  {
    step: "2",
    icon: Upload,
    title: "Upload Your Agent",
    description: "Have your own AI agent? Upload it to share with the community or deploy it for your own use.",
    action: "Upload Agent",
    href: "/upload",
    color: "from-green-500 to-teal-500"
  },
  {
    step: "3",
    icon: Rocket,
    title: "Deploy to Cloud",
    description: "Deploy your AI agent to the cloud with one click. Get a live URL to access your agent.",
    action: "Deploy Now",
    href: "/deploy",
    color: "from-orange-500 to-red-500"
  },
  {
    step: "4",
    icon: Globe,
    title: "Create Web Embeds",
    description: "Embed any website and add AI functionality without modifying the original site",
    action: "Create Embed",
    href: "/web-embeds",
    color: "from-purple-500 to-pink-500"
  }
];

const features = [
  {
    icon: Bot,
    title: "AI Agent Marketplace",
    description: "Browse hundreds of pre-built AI agents for various tasks and industries",
    benefits: ["Ready to use", "No coding required", "Multiple categories"]
  },
  {
    icon: Cloud,
    title: "Cloud Deployment",
    description: "Deploy your AI agents to the cloud with automatic scaling and monitoring",
    benefits: ["One-click deployment", "Auto-scaling", "99.9% uptime"]
  },
  {
    icon: Globe,
    title: "Web Embed System",
    description: "Embed any website and add AI functionality without modifying the original site",
    benefits: ["Easy integration", "No code changes", "Secure iframes"]
  },
  {
    icon: Database,
    title: "Data Processing",
    description: "Process and analyze large datasets with advanced AI algorithms",
    benefits: ["Fast processing", "Multiple formats", "Real-time insights"]
  }
];

const useCases = [
  {
    title: "Customer Service",
    description: "Deploy AI agents to handle customer inquiries 24/7",
    icon: Users,
    examples: ["FAQ bots", "Order tracking", "Support tickets"]
  },
  {
    title: "Content Creation",
    description: "Generate articles, social media posts, and marketing copy",
    icon: BookOpen,
    examples: ["Blog posts", "Social media", "Email campaigns"]
  },
  {
    title: "Data Analysis",
    description: "Analyze large datasets and generate insights automatically",
    icon: TrendingUp,
    examples: ["Sales reports", "User analytics", "Market research"]
  },
  {
    title: "Process Automation",
    description: "Automate repetitive tasks and workflows",
    icon: Zap,
    examples: ["Data entry", "File processing", "Report generation"]
  }
];

const tips = [
  {
    icon: Lightbulb,
    title: "Start Small",
    description: "Begin with simple agents and gradually build more complex solutions"
  },
  {
    icon: Shield,
    title: "Test Thoroughly",
    description: "Always test your agents in a safe environment before deployment"
  },
  {
    icon: Settings,
    title: "Monitor Performance",
    description: "Use our dashboard to track agent performance and usage metrics"
  },
  {
    icon: Users,
    title: "Share & Collaborate",
    description: "Share your agents with the community and get feedback from other users"
  }
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-background pt-32">
      <div className="container">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 mb-8"
          >
            <Badge variant="secondary" className="bg-ai-primary/10 text-ai-primary border-ai-primary/20">
              <BookOpen className="w-4 h-4 mr-2" />
              Complete Guide
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            How to Use
            <br />
            <span className="text-gradient">AI Agency</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Learn how to discover, create, deploy, and manage AI agents. Everything you need to know to get started with AI automation.
          </motion.p>
        </div>

        {/* Getting Started Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold text-white mb-4"
            >
              Getting Started
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              Follow these 4 simple steps to start using AI agents
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {gettingStartedSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${step.color} flex items-center justify-center`}>
                        <step.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-ai-accent flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{step.step}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl text-white">{step.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={step.href}>
                      <Button className="w-full bg-gradient-to-r from-ai-primary to-ai-secondary hover:from-ai-primary/90 hover:to-ai-secondary/90">
                        {step.action}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold text-white mb-4"
            >
              Key Features
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              Everything you need to build and deploy AI solutions
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-muted-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold text-white mb-4"
            >
              Popular Use Cases
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              See how others are using AI agents to solve real problems
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-4">
                      <useCase.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-white">{useCase.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {useCase.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {useCase.examples.map((example, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-ai-primary rounded-full"></div>
                          <span className="text-sm text-muted-foreground">{example}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Tips Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold text-white mb-4"
            >
              Pro Tips
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-muted-foreground"
            >
              Best practices for getting the most out of AI Agency
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-4">
                      <tip.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-white">{tip.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {tip.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start exploring AI agents and building your first AI solution today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/marketplace">
                <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                  <Search className="w-5 h-5 mr-2" />
                  Browse Marketplace
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/upload">
                <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Your Agent
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
} 