"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Play, 
  ArrowRight,
  ExternalLink,
  CheckCircle,
  Star,
  Users,
  Globe,
  Code,
  Download,
  MessageSquare,
  FileText,
  Lightbulb,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const integrationFeatures = [
  {
    title: "Xeinst Agent Module",
    description: "Use AI agents as native Make.com modules in your scenarios",
    icon: Zap,
    details: "Seamlessly integrate AI agents into your Make scenarios with typed inputs and outputs."
  },
  {
    title: "OAuth Integration",
    description: "Secure authentication with your Xeinst account",
    icon: Shield,
    details: "Connect your Make account to Xeinst with secure OAuth 2.0 authentication."
  },
  {
    title: "Agent Selection",
    description: "Choose from your deployed agents and versions",
    icon: Code,
    details: "Select specific agent versions and channels for consistent, reliable automation."
  },
  {
    title: "Error Handling",
    description: "Built-in retry logic and error management",
    icon: CheckCircle,
    details: "Robust error handling with automatic retries and detailed error reporting."
  }
];

const useCases = [
  {
    title: "Customer Support Automation",
    description: "Auto-triage support tickets and generate responses",
    scenario: "Email → Xeinst Agent → CRM Update → Notification",
    icon: MessageSquare
  },
  {
    title: "Sales Lead Processing",
    description: "Enrich and qualify leads automatically",
    scenario: "Form Submission → Xeinst Agent → Lead Scoring → CRM",
    icon: Users
  },
  {
    title: "Content Generation",
    description: "Generate and publish content across platforms",
    scenario: "Trigger → Xeinst Agent → Content → Social Media",
    icon: FileText
  },
  {
    title: "Data Analysis",
    description: "Process and analyze data with AI insights",
    scenario: "Data Source → Xeinst Agent → Analysis → Report",
    icon: Lightbulb
  }
];

const prebuiltScenarios = [
  {
    name: "Support Ticket Triage",
    category: "Customer Support",
    description: "Automatically categorize and route support tickets",
    complexity: "Beginner",
    modules: 5
  },
  {
    name: "Lead Enrichment",
    category: "Sales & Marketing",
    description: "Enrich lead data with AI-powered research",
    complexity: "Intermediate",
    modules: 8
  },
  {
    name: "Content Moderation",
    category: "Content Management",
    description: "Moderate user-generated content with AI",
    complexity: "Advanced",
    modules: 12
  },
  {
    name: "Invoice Processing",
    category: "Finance",
    description: "Extract and process invoice data automatically",
    complexity: "Intermediate",
    modules: 10
  }
];

const goToMarket = [
  {
    title: "Co-Marketing",
    description: "Joint webinars, blog posts, and case studies",
    icon: Star
  },
  {
    title: "Marketplace Listing",
    description: "Featured placement in Make.com marketplace",
    icon: Globe
  },
  {
    title: "Revenue Sharing",
    description: "Shared revenue on paid conversions",
    icon: Users
  },
  {
    title: "Success Stories",
    description: "Joint customer success stories and testimonials",
    icon: CheckCircle
  }
];

export default function MakePartnershipPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark"></div>
        <div className="absolute inset-0 grid-bg opacity-20"></div>
        
        <div className="container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                <Zap className="w-4 h-4 mr-2" />
                Official Make.com Partnership
              </Badge>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold text-gradient mb-6"
            >
              Xeinst + Make.com
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Bring AI agents into your Make scenarios without leaving Make. 
              Use Xeinst agents as native Make.com modules for powerful automation.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Zap className="w-5 h-5 mr-2" />
                Try in Make.com
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

      {/* Integration Features */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Integration Features
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Seamlessly integrate AI agents into your Make scenarios
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {integrationFeatures.map((feature, index) => (
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
                    <CardTitle className="text-2xl text-white">{feature.title}</CardTitle>
                    <CardDescription className="text-muted-foreground text-lg">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.details}</p>
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
              Use Cases
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Powerful automation scenarios with AI agents
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
                    <div className="p-4 bg-black/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Scenario Flow:</p>
                      <p className="text-ai-primary font-mono text-sm">{useCase.scenario}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prebuilt Scenarios */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Prebuilt Scenarios
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Ready-to-use scenarios featuring Xeinst agents
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {prebuiltScenarios.map((scenario, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="bg-ai-primary/10 text-ai-primary border-ai-primary/20">
                        {scenario.category}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`${
                          scenario.complexity === 'Beginner' 
                            ? 'border-green-500/20 text-green-500'
                            : scenario.complexity === 'Intermediate'
                            ? 'border-yellow-500/20 text-yellow-500'
                            : 'border-red-500/20 text-red-500'
                        }`}
                      >
                        {scenario.complexity}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-white">{scenario.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {scenario.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{scenario.modules} modules</span>
                      <Button size="sm" variant="ghost" className="text-ai-primary hover:text-white">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Open
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Go-to-Market */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Partnership Benefits
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Joint go-to-market initiatives and mutual benefits
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {goToMarket.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-6 mx-auto">
                      <benefit.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
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
              Start using Xeinst agents in your Make.com scenarios today.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Zap className="w-5 h-5 mr-2" />
                Connect to Make.com
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <Download className="w-5 h-5 mr-2" />
                View Documentation
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
