"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Play, 
  ArrowRight,
  Zap,
  Search,
  ExternalLink,
  CheckCircle,
  Star,
  Users,
  Database,
  MessageSquare,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";
// import Link from "next/link";
import { useState } from "react";

const integrationCategories = [
  {
    name: "All",
    count: 100,
    active: true
  },
  {
    name: "CRM",
    count: 15,
    active: false
  },
  {
    name: "Communication",
    count: 12,
    active: false
  },
  {
    name: "Productivity",
    count: 18,
    active: false
  },
  {
    name: "Data & Analytics",
    count: 25,
    active: false
  },
  {
    name: "Development",
    count: 20,
    active: false
  },
  {
    name: "Marketing",
    count: 10,
    active: false
  }
];

const integrations = [
  {
    name: "Make.com",
    description: "Connect agents to Make scenarios as nodes",
    category: "Productivity",
    icon: Zap,
    color: "from-blue-500 to-purple-500",
    featured: true,
    status: "Available"
  },
  {
    name: "N8N",
    description: "Use agents as N8N workflow nodes",
    category: "Productivity", 
    icon: Globe,
    color: "from-green-500 to-teal-500",
    featured: true,
    status: "Available"
  },
  {
    name: "Slack",
    description: "Deploy agents as Slack bots and workflows",
    category: "Communication",
    icon: MessageSquare,
    color: "from-purple-500 to-pink-500",
    featured: false,
    status: "Available"
  },
  {
    name: "Google Workspace",
    description: "Integrate with Gmail, Docs, Sheets, and Calendar",
    category: "Productivity",
    icon: FileText,
    color: "from-red-500 to-orange-500",
    featured: false,
    status: "Available"
  },
  {
    name: "HubSpot",
    description: "Sync with contacts, deals, and marketing automation",
    category: "CRM",
    icon: Users,
    color: "from-orange-500 to-red-500",
    featured: false,
    status: "Available"
  },
  {
    name: "Salesforce",
    description: "Connect to leads, opportunities, and custom objects",
    category: "CRM",
    icon: Database,
    color: "from-blue-500 to-indigo-500",
    featured: false,
    status: "Available"
  },
  {
    name: "Jira",
    description: "Create and manage tickets with AI agents",
    category: "Development",
    icon: CheckCircle,
    color: "from-blue-500 to-cyan-500",
    featured: false,
    status: "Available"
  },
  {
    name: "Webhooks",
    description: "Trigger agents via HTTP webhooks",
    category: "Development",
    icon: Zap,
    color: "from-gray-500 to-gray-600",
    featured: false,
    status: "Available"
  }
];

const bridgeFeatures = [
  {
    title: "Make.com Bridge",
    description: "Use agents as Make modules with typed inputs and outputs",
    icon: Zap,
    details: "Seamlessly integrate AI agents into your Make scenarios. Input JSON → guarded agent → typed output."
  },
  {
    title: "N8N Bridge", 
    description: "Deploy agents as N8N nodes with full workflow integration",
    icon: Globe,
    details: "Open-source community play with recipes, PRs, and demo workflows. Use agents as native N8N nodes."
  }
];

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === "All" || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
              Integrations
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Connect your AI agents to 100+ apps and services. Native connectors, webhooks, and bridge integrations.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Globe className="w-5 h-5 mr-2" />
                Browse Integrations
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

      {/* Bridge Integrations */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Bridge Integrations
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Use agents as nodes in Make and N8N workflows
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {bridgeFeatures.map((bridge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-4">
                      <bridge.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white">{bridge.title}</CardTitle>
                    <CardDescription className="text-muted-foreground text-lg">
                      {bridge.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">{bridge.details}</p>
                    <div className="flex gap-4">
                      <Button className="bg-gradient-ai hover:bg-gradient-ai/90">
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Docs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Directory */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Integration Directory
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Connect to your favorite tools and services
            </motion.p>
          </div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background/50 border border-ai-primary/20 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ai-primary focus:border-transparent"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {integrationCategories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.name
                        ? 'bg-ai-primary text-white'
                        : 'bg-background/50 text-muted-foreground hover:text-white hover:bg-ai-primary/20'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Integration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredIntegrations.map((integration, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${integration.color} flex items-center justify-center`}>
                        <integration.icon className="w-5 h-5 text-white" />
                      </div>
                      {integration.featured && (
                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg text-white">{integration.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-green-500/20 text-green-500">
                        {integration.status}
                      </Badge>
                      <Button size="sm" variant="ghost" className="text-ai-primary hover:text-white">
                        Connect
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
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
              Need a Custom Integration?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Don't see the integration you need? We can build custom connectors for your specific use case.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Globe className="w-5 h-5 mr-2" />
                Request Integration
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <ExternalLink className="w-5 h-5 mr-2" />
                View API Docs
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
