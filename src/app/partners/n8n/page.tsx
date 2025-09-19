"use client";

import { Button } from "../../../components/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { 
  Globe, 
  Play, 
  ArrowRight,
  ExternalLink,
  Star,
  Users,
  Code,
  MessageSquare,
  FileText,
  Lightbulb,
  GitBranch,
  Heart
} from "lucide-react";
import { motion } from "framer-motion";
// import Link from "next/link";

const integrationFeatures = [
  {
    title: "Xeinst Agent Node",
    description: "Native N8N node for running AI agents in workflows",
    icon: Globe,
    details: "Use 'xeinstAgent.run' node to execute AI agents directly in your N8N workflows with full error handling."
  },
  {
    title: "Open Source Community",
    description: "Community-driven development and contributions",
    icon: Heart,
    details: "Open source integration with community recipes, PRs, and collaborative development."
  },
  {
    title: "Workflow Templates",
    description: "Pre-built workflow templates and recipes",
    icon: FileText,
    details: "Ready-to-use workflow templates featuring Xeinst agents for common automation scenarios."
  },
  {
    title: "Custom Development",
    description: "Extensible architecture for custom integrations",
    icon: Code,
    details: "Build custom nodes and workflows with our comprehensive API and SDK support."
  }
];

const communityFeatures = [
  {
    title: "Community Recipes",
    description: "Share and discover workflow recipes with the community",
    icon: Users,
    count: "50+"
  },
  {
    title: "GitHub Integration",
    description: "Contribute to open source development",
    icon: GitBranch,
    count: "Active"
  },
  {
    title: "Community Challenges",
    description: "Participate in automation challenges and contests",
    icon: Star,
    count: "Monthly"
  },
  {
    title: "Documentation",
    description: "Comprehensive guides and tutorials",
    icon: FileText,
    count: "Growing"
  }
];

const workflowTemplates = [
  {
    name: "AI Content Pipeline",
    category: "Content Creation",
    description: "Generate, review, and publish content with AI agents",
    complexity: "Intermediate",
    nodes: 8,
    features: ["Content Generation", "Quality Review", "Multi-platform Publishing"]
  },
  {
    name: "Smart Data Processing",
    category: "Data Analytics",
    description: "Process and analyze data with AI insights",
    complexity: "Advanced",
    nodes: 12,
    features: ["Data Extraction", "AI Analysis", "Report Generation"]
  },
  {
    name: "Customer Onboarding",
    category: "Customer Success",
    description: "Automated customer onboarding with AI assistance",
    complexity: "Beginner",
    nodes: 6,
    features: ["Welcome Sequence", "Data Collection", "Task Assignment"]
  },
  {
    name: "Intelligent Monitoring",
    category: "DevOps",
    description: "AI-powered system monitoring and alerting",
    complexity: "Advanced",
    nodes: 15,
    features: ["System Monitoring", "Anomaly Detection", "Auto-remediation"]
  }
];

const developmentResources = [
  {
    title: "N8N Node Development",
    description: "Guide to building custom N8N nodes with Xeinst",
    icon: Code,
    type: "Tutorial"
  },
  {
    title: "API Reference",
    description: "Complete API documentation for Xeinst integration",
    icon: FileText,
    type: "Documentation"
  },
  {
    title: "SDK Examples",
    description: "Code examples and sample implementations",
    icon: Lightbulb,
    type: "Examples"
  },
  {
    title: "Community Forum",
    description: "Connect with other developers and get help",
    icon: MessageSquare,
    type: "Community"
  }
];

const partnershipBenefits = [
  {
    title: "Open Source Collaboration",
    description: "Joint development of open source integrations and tools",
    icon: GitBranch
  },
  {
    title: "Community Engagement",
    description: "Active participation in N8N community events and forums",
    icon: Users
  },
  {
    title: "Template Marketplace",
    description: "Featured placement in N8N template marketplace",
    icon: Star
  },
  {
    title: "Co-Marketing",
    description: "Joint marketing initiatives and content creation",
    icon: Globe
  }
];

export default function N8NPartnershipPage() {
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
              <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                <Globe className="w-4 h-4 mr-2" />
                Open Source Partnership
              </Badge>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold text-gradient mb-6"
            >
              Xeinst + N8N
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Open source community play with N8N. Use AI agents as native N8N nodes 
              with community-driven development and shared recipes.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Globe className="w-5 h-5 mr-2" />
                Try N8N Node
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
              Open source integration with community-driven development
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

      {/* Community Features */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Community Features
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Active community engagement and open source collaboration
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {communityFeatures.map((feature, index) => (
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
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                      {feature.count}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Templates */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Workflow Templates
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Pre-built workflows featuring Xeinst AI agents
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {workflowTemplates.map((template, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="bg-ai-primary/10 text-ai-primary border-ai-primary/20">
                        {template.category}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`${
                          template.complexity === 'Beginner' 
                            ? 'border-green-500/20 text-green-500'
                            : template.complexity === 'Intermediate'
                            ? 'border-yellow-500/20 text-yellow-500'
                            : 'border-red-500/20 text-red-500'
                        }`}
                      >
                        {template.complexity}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-white">{template.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{template.nodes} nodes</span>
                        <Button size="sm" variant="ghost" className="text-ai-primary hover:text-white">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Import
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {template.features.map((feature, featureIndex) => (
                          <Badge key={featureIndex} variant="outline" className="text-xs border-ai-primary/20 text-ai-primary">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Development Resources */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Development Resources
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Everything you need to build with Xeinst and N8N
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {developmentResources.map((resource, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-6 mx-auto">
                      <resource.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{resource.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{resource.description}</p>
                    <Badge variant="secondary" className="bg-ai-primary/10 text-ai-primary border-ai-primary/20">
                      {resource.type}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
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
              Open source collaboration and community engagement
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {partnershipBenefits.map((benefit, index) => (
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
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Join the Community
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Start building with Xeinst and N8N. Contribute to open source and share your workflows.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Globe className="w-5 h-5 mr-2" />
                Install N8N Node
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <GitBranch className="w-5 h-5 mr-2" />
                View on GitHub
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
