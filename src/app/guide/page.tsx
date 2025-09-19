"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui";
import { Badge } from "../../components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  BookOpen, 
  Search, 
  Upload, 
  Globe, 
  Bot, 
  Code, 
  Settings, 
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Zap,
  Users,
  Shield,
  BarChart3
} from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse & Discover",
    description: "Explore our marketplace of AI agents and find the perfect solution for your needs",
    details: [
      "Browse by category, price, or popularity",
      "Read detailed descriptions and reviews",
      "Test agents before purchasing",
      "Filter by features and capabilities"
    ],
    action: "Browse Marketplace",
    href: "/marketplace",
    color: "from-blue-500 to-purple-500"
  },
  {
    icon: Upload,
    title: "Create & Upload",
    description: "Build your own AI agents or upload existing ones to the marketplace",
    details: [
      "Upload webhook-based agents",
      "Configure input schemas and validation",
      "Set pricing and access controls",
      "Add documentation and examples"
    ],
    action: "Upload Agent",
    href: "/upload",
    color: "from-green-500 to-teal-500"
  },
  {
    icon: Globe,
    title: "Web Embeds",
    description: "Embed existing tools and applications without full agent setup",
    details: [
      "Paste URLs of existing tools",
      "Configure embedding settings",
      "Add AI functionality later",
      "Instant deployment via iframe"
    ],
    action: "Create Embed",
    href: "/upload",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Settings,
    title: "Manage & Monitor",
    description: "Track performance, manage deployments, and optimize your agents",
    details: [
      "Monitor usage and performance",
      "View analytics and insights",
      "Manage user feedback",
      "Scale and optimize agents"
    ],
    action: "Go to Dashboard",
    href: "/dashboard",
    color: "from-orange-500 to-red-500"
  }
];

const features = [
  {
    icon: Bot,
    title: "AI Agent Marketplace",
    description: "Browse and use hundreds of pre-built AI agents for various tasks",
    benefits: ["Ready-to-use solutions", "No coding required", "Test before buying", "Community reviews"]
  },
  {
    icon: Code,
    title: "Custom Agent Creation",
    description: "Build and deploy your own AI agents with webhook integration",
    benefits: ["Full customization", "Webhook support", "Input validation", "Documentation tools"]
  },
  {
    icon: Globe,
    title: "Web Embed System",
    description: "Embed existing tools and applications without full setup",
    benefits: ["Quick integration", "No full agent needed", "Instant deployment", "Flexible configuration"]
  },
  {
    icon: BarChart3,
    title: "Analytics & Monitoring",
    description: "Track performance and get insights into your agent usage",
    benefits: ["Usage analytics", "Performance metrics", "User feedback", "Optimization tools"]
  }
];

const tips = [
  {
    icon: Lightbulb,
    title: "Start with Browsing",
    description: "Explore the marketplace first to understand what's available before creating your own agents."
  },
  {
    icon: Zap,
    title: "Test Before Buying",
    description: "Always test agents with sample inputs to ensure they meet your requirements."
  },
  {
    icon: Users,
    title: "Check Reviews",
    description: "Read user reviews and ratings to find the most reliable and effective agents."
  },
  {
    icon: Shield,
    title: "Security First",
    description: "When uploading agents, ensure your webhooks are secure and properly validated."
  }
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-dark">
        <div className="absolute inset-0 grid-bg opacity-10"></div>
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center space-x-2 mb-6">
              <Badge className="bg-ai-primary/20 text-ai-primary border-ai-primary/30 px-4 py-2 text-sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Platform Guide
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-gradient-animate">How to Use</span>
              <br />
              <span className="text-white">XEINST Platform</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Learn how to browse, create, and manage AI agents on our platform. 
              Everything you need to get started in one comprehensive guide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Getting Started Steps */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Getting Started
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Four simple steps to start using AI agents on our platform
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${step.color} flex items-center justify-center mb-4`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-white">{step.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start space-x-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
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
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Platform Features
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Everything you need to work with AI agents effectively
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    <div className="grid grid-cols-2 gap-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pro Tips */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Pro Tips
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Expert advice to help you get the most out of the platform
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mb-4">
                      <tip.icon className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-lg text-white">{tip.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground">
                      {tip.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
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
              Choose your path and start exploring AI agents today
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
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
                  Upload Agent
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
} 