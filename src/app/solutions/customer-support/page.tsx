"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Play, 
  ArrowRight,
  Zap,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Star,
  Shield,
  Bot,
  FileText,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const useCases = [
  {
    title: "Auto-triage Support Tickets",
    description: "Automatically categorize and route tickets based on content and urgency",
    icon: MessageSquare,
    benefits: ["50% faster ticket routing", "Reduced human error", "24/7 availability"]
  },
  {
    title: "Draft Response Generation",
    description: "Generate personalized responses based on ticket content and knowledge base",
    icon: FileText,
    benefits: ["80% faster response time", "Consistent quality", "Agent productivity boost"]
  },
  {
    title: "Ticket Updates & Follow-ups",
    description: "Automatically update ticket status and send follow-up communications",
    icon: Clock,
    benefits: ["Reduced manual work", "Better customer experience", "Improved SLA compliance"]
  }
];

const metrics = [
  {
    label: "Response Time",
    value: "80% faster",
    icon: Zap
  },
  {
    label: "Resolution Rate",
    value: "+35%",
    icon: TrendingUp
  },
  {
    label: "Agent Productivity",
    value: "+60%",
    icon: Users
  },
  {
    label: "Customer Satisfaction",
    value: "+25%",
    icon: Star
  }
];

const features = [
  {
    icon: Bot,
    title: "Intelligent Ticket Routing",
    description: "AI-powered categorization and priority assignment based on content analysis"
  },
  {
    icon: MessageSquare,
    title: "Response Generation",
    description: "Generate contextual responses using your knowledge base and ticket history"
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    description: "Built-in quality checks and approval workflows for sensitive responses"
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track response times, resolution rates, and customer satisfaction metrics"
  }
];

const caseStudy = {
  company: "TechFlow Solutions",
  industry: "SaaS",
  challenge: "High ticket volume with slow response times and inconsistent quality",
  solution: "Implemented Xeinst customer support agents for auto-triage and response generation",
  results: [
    "75% reduction in first response time",
    "40% increase in resolution rate", 
    "90% customer satisfaction score",
    "60% reduction in agent workload"
  ]
};

export default function CustomerSupportPage() {
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
              Customer Support
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Transform your customer support with AI agents that auto-triage tickets, 
              draft responses, and provide 24/7 assistance.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <MessageSquare className="w-5 h-5 mr-2" />
                Try Template
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

      {/* Metrics */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Proven Results
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Real impact from companies using Xeinst for customer support
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="text-center border-ai-primary/20 hover:border-ai-primary/40 transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mx-auto mb-4">
                      <metric.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
                    <div className="text-sm text-muted-foreground">{metric.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              How It Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Three key use cases for customer support automation
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    <ul className="space-y-2">
                      {useCase.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Key Features
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Everything you need for intelligent customer support
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
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Case Study
              </h2>
              <p className="text-xl text-muted-foreground">
                How {caseStudy.company} transformed their customer support
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-ai-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <CardTitle className="text-2xl text-white">{caseStudy.company}</CardTitle>
                      <CardDescription className="text-muted-foreground">{caseStudy.industry} Company</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Success Story
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Challenge</h4>
                    <p className="text-muted-foreground">{caseStudy.challenge}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Solution</h4>
                    <p className="text-muted-foreground">{caseStudy.solution}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Results</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {caseStudy.results.map((result, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-muted-foreground">{result}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
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
              Ready to Transform Your Support?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Start with our customer support template and customize it for your needs.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <MessageSquare className="w-5 h-5 mr-2" />
                Try Customer Support Template
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
    </div>
  );
}
