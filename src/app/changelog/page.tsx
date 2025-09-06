"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Play, 
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Shield,
  Globe,
  Code,
  Users,
  Bug,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
// import Link from "next/link";

const changelogEntries = [
  {
    version: "v1.2.0",
    date: "2024-01-15",
    type: "major",
    items: [
      {
        type: "feature",
        title: "Advanced Guardrails",
        description: "Added policy packs for PII detection and content filtering",
        icon: Shield
      },
      {
        type: "feature", 
        title: "Make.com Integration",
        description: "Native integration with Make.com workflows",
        icon: Globe
      },
      {
        type: "improvement",
        title: "Performance Optimization",
        description: "50% faster agent execution with optimized model routing",
        icon: Zap
      }
    ]
  },
  {
    version: "v1.1.5",
    date: "2024-01-08",
    type: "patch",
    items: [
      {
        type: "fix",
        title: "Bug Fixes",
        description: "Fixed memory leak in long-running agents",
        icon: Bug
      },
      {
        type: "improvement",
        title: "UI Improvements",
        description: "Enhanced agent builder interface with better error handling",
        icon: Sparkles
      }
    ]
  },
  {
    version: "v1.1.0",
    date: "2024-01-01",
    type: "minor",
    items: [
      {
        type: "feature",
        title: "Team Collaboration",
        description: "Added shared workspaces and team management",
        icon: Users
      },
      {
        type: "feature",
        title: "Advanced Analytics",
        description: "Custom dashboards and performance metrics",
        icon: Zap
      },
      {
        type: "feature",
        title: "API v1.1",
        description: "Enhanced API with webhook support",
        icon: Code
      }
    ]
  },
  {
    version: "v1.0.5",
    date: "2023-12-20",
    type: "patch",
    items: [
      {
        type: "fix",
        title: "Security Fix",
        description: "Patched authentication vulnerability",
        icon: Shield
      },
      {
        type: "improvement",
        title: "Documentation",
        description: "Updated API documentation with examples",
        icon: FileText
      }
    ]
  },
  {
    version: "v1.0.0",
    date: "2023-12-01",
    type: "major",
    items: [
      {
        type: "feature",
        title: "Agent Builder",
        description: "Visual agent designer with drag-and-drop interface",
        icon: Code
      },
      {
        type: "feature",
        title: "Basic Observability",
        description: "Traces, metrics, and performance monitoring",
        icon: Zap
      },
      {
        type: "feature",
        title: "Core Integrations",
        description: "Slack, webhooks, and basic API connectors",
        icon: Globe
      }
    ]
  }
];

const getVersionTypeColor = (type: string) => {
  switch (type) {
    case "major":
      return "from-red-500 to-orange-500";
    case "minor":
      return "from-blue-500 to-purple-500";
    case "patch":
      return "from-green-500 to-teal-500";
    default:
      return "from-gray-500 to-gray-600";
  }
};

const getItemTypeIcon = (type: string) => {
  switch (type) {
    case "feature":
      return Star;
    case "improvement":
      return Zap;
    case "fix":
      return Bug;
    case "security":
      return Shield;
    default:
      return CheckCircle;
  }
};

const getItemTypeColor = (type: string) => {
  switch (type) {
    case "feature":
      return "text-green-500";
    case "improvement":
      return "text-blue-500";
    case "fix":
      return "text-orange-500";
    case "security":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};

export default function ChangelogPage() {
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
              Changelog
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Stay up to date with the latest features, improvements, and fixes. 
              We ship updates regularly to make Xeinst better.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Star className="w-5 h-5 mr-2" />
                Follow Updates
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

      {/* Changelog Entries */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {changelogEntries.map((entry, entryIndex) => (
                <motion.div
                  key={entryIndex}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: entryIndex * 0.1 }}
                >
                  <Card className="border-ai-primary/20 hover:border-ai-primary/40 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getVersionTypeColor(entry.type)} flex items-center justify-center`}>
                            <span className="text-white font-bold text-lg">
                              {entry.type === "major" ? "M" : entry.type === "minor" ? "m" : "p"}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-2xl text-white">{entry.version}</CardTitle>
                            <CardDescription className="text-muted-foreground">
                              {new Date(entry.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${
                            entry.type === "major" 
                              ? 'border-red-500/20 text-red-500'
                              : entry.type === "minor"
                              ? 'border-blue-500/20 text-blue-500'
                              : 'border-green-500/20 text-green-500'
                          }`}
                        >
                          {entry.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {entry.items.map((item, itemIndex) => {
                          const IconComponent = getItemTypeIcon(item.type);
                          return (
                            <div key={itemIndex} className="flex items-start space-x-3">
                              <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${getItemTypeColor(item.type)}`} />
                              <div>
                                <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                                <p className="text-muted-foreground">{item.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe to Updates */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Stay Updated
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Get notified about new releases, features, and important updates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                  <Star className="w-5 h-5 mr-2" />
                  Subscribe to Updates
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                  <FileText className="w-5 h-5 mr-2" />
                  RSS Feed
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
