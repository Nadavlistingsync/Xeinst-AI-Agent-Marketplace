"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Map, 
  Play, 
  ArrowRight,
  CheckCircle,
  Clock,
  Star,
  Zap,
  Shield,
  Globe,
  Code,
  Users,
  Database,
  MessageSquare,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const roadmapItems = [
  {
    quarter: "Q1 2024",
    status: "completed",
    items: [
      {
        title: "Agent Builder Launch",
        description: "Visual agent designer with drag-and-drop interface",
        category: "Core Platform",
        icon: Code,
        completed: true
      },
      {
        title: "Basic Observability",
        description: "Traces, metrics, and basic performance monitoring",
        category: "Observability",
        icon: Zap,
        completed: true
      },
      {
        title: "Core Integrations",
        description: "Slack, webhooks, and basic API connectors",
        category: "Integrations",
        icon: Globe,
        completed: true
      }
    ]
  },
  {
    quarter: "Q2 2024",
    status: "in-progress",
    items: [
      {
        title: "Advanced Guardrails",
        description: "Policy packs, content filters, and PII detection",
        category: "Security",
        icon: Shield,
        completed: false
      },
      {
        title: "Make.com Integration",
        description: "Native Make.com bridge with agent nodes",
        category: "Integrations",
        icon: Globe,
        completed: false
      },
      {
        title: "Team Collaboration",
        description: "Shared workspaces, RBAC, and team management",
        category: "Platform",
        icon: Users,
        completed: false
      },
      {
        title: "SOC 2 Type II",
        description: "Security compliance certification",
        category: "Security",
        icon: Shield,
        completed: false
      }
    ]
  },
  {
    quarter: "Q3 2024",
    status: "planned",
    items: [
      {
        title: "N8N Integration",
        description: "Native N8N workflow integration",
        category: "Integrations",
        icon: Globe,
        completed: false
      },
      {
        title: "Advanced Analytics",
        description: "Custom dashboards, reporting, and insights",
        category: "Observability",
        icon: Zap,
        completed: false
      },
      {
        title: "Marketplace Launch",
        description: "Public marketplace for agent templates",
        category: "Platform",
        icon: Star,
        completed: false
      },
      {
        title: "VPC Deployment",
        description: "Private cloud and on-premise deployment options",
        category: "Enterprise",
        icon: Database,
        completed: false
      }
    ]
  },
  {
    quarter: "Q4 2024",
    status: "planned",
    items: [
      {
        title: "Multi-Model Support",
        description: "Support for multiple LLM providers and models",
        category: "Platform",
        icon: Code,
        completed: false
      },
      {
        title: "Advanced Workflows",
        description: "Complex branching, loops, and conditional logic",
        category: "Platform",
        icon: Zap,
        completed: false
      },
      {
        title: "Enterprise SSO",
        description: "SAML, SCIM, and advanced identity management",
        category: "Enterprise",
        icon: Shield,
        completed: false
      },
      {
        title: "API v2.0",
        description: "Enhanced API with webhooks and real-time events",
        category: "Platform",
        icon: Code,
        completed: false
      }
    ]
  }
];

const upcomingFeatures = [
  {
    title: "AI Model Fine-tuning",
    description: "Fine-tune models on your specific data and use cases",
    votes: 156,
    category: "Platform"
  },
  {
    title: "Multi-language Support",
    description: "Support for agents in multiple languages",
    votes: 89,
    category: "Platform"
  },
  {
    title: "Mobile SDK",
    description: "Native mobile SDKs for iOS and Android",
    votes: 67,
    category: "Platform"
  },
  {
    title: "Advanced Testing",
    description: "Automated testing framework for agents",
    votes: 134,
    category: "Platform"
  },
  {
    title: "Cost Optimization",
    description: "Automatic model selection based on cost and performance",
    votes: 98,
    category: "Platform"
  },
  {
    title: "Real-time Collaboration",
    description: "Live collaboration on agent development",
    votes: 45,
    category: "Platform"
  }
];

export default function RoadmapPage() {
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
              Product Roadmap
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              See what we're building next. Our roadmap is public and driven by your feedback.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Star className="w-5 h-5 mr-2" />
                Request Feature
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Development Timeline
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Our planned releases and major milestones
            </motion.p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="space-y-12">
              {roadmapItems.map((quarter, quarterIndex) => (
                <motion.div
                  key={quarterIndex}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: quarterIndex * 0.1 }}
                >
                  <div className="flex items-center mb-8">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-ai-primary/30 to-transparent"></div>
                    <div className="px-6">
                      <Badge 
                        variant="outline" 
                        className={`text-lg px-4 py-2 ${
                          quarter.status === 'completed' 
                            ? 'border-green-500/20 text-green-500'
                            : quarter.status === 'in-progress'
                            ? 'border-yellow-500/20 text-yellow-500'
                            : 'border-blue-500/20 text-blue-500'
                        }`}
                      >
                        {quarter.status === 'completed' && <CheckCircle className="w-4 h-4 mr-2" />}
                        {quarter.status === 'in-progress' && <Clock className="w-4 h-4 mr-2" />}
                        {quarter.status === 'planned' && <Calendar className="w-4 h-4 mr-2" />}
                        {quarter.quarter}
                      </Badge>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-ai-primary/30 to-transparent"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quarter.items.map((item, itemIndex) => (
                      <motion.div
                        key={itemIndex}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: (quarterIndex * 0.1) + (itemIndex * 0.05) }}
                      >
                        <Card className={`h-full transition-all duration-300 ${
                          item.completed 
                            ? 'border-green-500/20 bg-green-500/5' 
                            : 'border-ai-primary/20 hover:border-ai-primary/40'
                        }`}>
                          <CardHeader>
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center">
                                <item.icon className="w-5 h-5 text-white" />
                              </div>
                              {item.completed && (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              )}
                            </div>
                            <CardTitle className="text-lg text-white">{item.title}</CardTitle>
                            <CardDescription className="text-muted-foreground">
                              {item.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Badge variant="secondary" className="bg-ai-primary/10 text-ai-primary border-ai-primary/20">
                              {item.category}
                            </Badge>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Features */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Upcoming Features
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Features we're considering based on community feedback
            </motion.p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {upcomingFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                >
                  <Card className="border-ai-primary/20 hover:border-ai-primary/40 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                          <p className="text-muted-foreground mb-3">{feature.description}</p>
                          <Badge variant="secondary" className="bg-ai-primary/10 text-ai-primary border-ai-primary/20">
                            {feature.category}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 ml-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{feature.votes}</div>
                            <div className="text-sm text-muted-foreground">votes</div>
                          </div>
                          <Button size="sm" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                            <Star className="w-4 h-4 mr-1" />
                            Vote
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
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
              Help Shape Our Roadmap
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Your feedback drives our development priorities. Request features, vote on ideas, and help us build the future of AI agents.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Star className="w-5 h-5 mr-2" />
                Request Feature
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <MessageSquare className="w-5 h-5 mr-2" />
                Join Community
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
