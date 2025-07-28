"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Users, 
  CheckCircle,
  Bot,
  Cpu,
  Cloud,
  Search,
  Upload,
  Rocket,
  Lightbulb
} from "lucide-react";
import { motion } from "framer-motion";

const quickActions = [
  {
    icon: Search,
    title: "Browse & Use",
    description: "Browse our marketplace of AI agents and find the perfect solution",
    href: "/marketplace",
    color: "from-blue-500 to-purple-500",
    buttonText: "Browse Marketplace"
  },
  {
    icon: Upload,
    title: "Create & Deploy",
    description: "Upload your AI agent or create web embeds - choose your path",
    href: "/upload",
    color: "from-green-500 to-teal-500",
    buttonText: "Upload Agent"
  },
  {
    icon: Rocket,
    title: "Deploy Agent",
    description: "Deploy your AI agent to the cloud with one click",
    href: "/deploy",
    color: "from-orange-500 to-red-500",
    buttonText: "Deploy Now"
  }
];



const features = [
  {
    icon: Bot,
    title: "AI Agent Marketplace",
    description: "Browse and deploy hundreds of pre-built AI agents for various tasks",
    href: "/marketplace"
  },
  {
    icon: Upload,
    title: "Upload & Embed System",
    description: "Upload full agents or create web embeds - choose your path",
    href: "/upload"
  },
  {
    icon: Cpu,
    title: "Smart Automation",
    description: "Automate complex workflows with AI-powered tools",
    href: "/dashboard"
  },
  {
    icon: Cloud,
    title: "Cloud Deployment",
    description: "Deploy your AI solutions instantly to the cloud",
    href: "/deploy"
  }
];

const stats = [
  { label: "AI Agents Available", value: "500+", icon: Bot },
  { label: "Active Users", value: "10K+", icon: Users },
  { label: "Success Rate", value: "99.9%", icon: CheckCircle },
  { label: "Uptime", value: "99.99%", icon: Shield }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-dark"></div>
        <div className="absolute inset-0 grid-bg opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-ai-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-ai-secondary/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-ai-accent/20 rounded-full blur-3xl animate-pulse-slow delay-2000"></div>
        </div>

        <div className="container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 mb-8"
            >
              <Badge variant="secondary" className="bg-ai-primary/10 text-ai-primary border-ai-primary/20">
                <Sparkles className="w-4 h-4 mr-2" />
                XEINST Platform
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-gradient mb-6"
            >
              XEINST Platform
              <br />
              <span className="text-white">AI Solutions</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Browse, create, and deploy AI agents. Embed existing tools without full setup. 
              Everything you need to build intelligent solutions in one place.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link href="/marketplace">
                <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                  <Search className="w-5 h-5 mr-2" />
                  Browse & Use
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/guide">
                <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Get Started
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="w-6 h-6 text-ai-primary mr-2" />
                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Get Started
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Choose from our main user journeys to get started quickly
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-4`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-white">{action.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {action.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={action.href}>
                      <Button className="w-full bg-gradient-to-r from-ai-primary to-ai-secondary hover:from-ai-primary/90 hover:to-ai-secondary/90">
                        {action.buttonText}
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

      {/* Main User Journeys Section */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Main User Journeys
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Three distinct paths to get started with AI solutions
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Path 1: Browse & Use */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white">Path 1: Browse & Use</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Find and use existing AI agents from our marketplace
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">1. Marketplace - Browse agents</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">2. Agent Details - View and run</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">3. Dashboard - Monitor usage</span>
                    </div>
                  </div>
                  <Link href="/marketplace">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                      Start Browsing
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Path 2: Create & Deploy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white">Path 2: Create & Deploy</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Build and deploy your own AI agents or create web embeds
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">1. Upload - Choose agent or web embed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">2. Configure - Set up your solution</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">3. Deploy - Launch to marketplace</span>
                    </div>
                  </div>
                  <Link href="/upload">
                    <Button className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                      Start Creating
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Path 3: Deploy & Manage */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-4">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white">Path 3: Deploy & Manage</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Deploy your solutions and manage them in the cloud
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">1. Deploy - Launch to cloud</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">2. Monitor - Track performance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">3. Scale - Optimize and grow</span>
                    </div>
                  </div>
                  <Link href="/deploy">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                      Start Deploying
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
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
                    <Link href={feature.href}>
                      <Button variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                        Learn More
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
              Choose your path and start building AI solutions today
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
              <Link href="/signup">
                <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                  <Users className="w-5 h-5 mr-2" />
                  Create Account
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
