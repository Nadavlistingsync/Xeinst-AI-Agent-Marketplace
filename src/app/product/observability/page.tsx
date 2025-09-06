"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Play, 
  ArrowRight,
  BarChart3,
  Download,
  Search,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
// import Link from "next/link";

const features = [
  {
    icon: BarChart3,
    title: "Traces Timeline",
    description: "Visual timeline of agent execution with detailed step-by-step breakdown",
    details: "See exactly how your agent processes each request, with timing, token usage, and decision points clearly displayed."
  },
  {
    icon: TrendingUp,
    title: "Performance Metrics",
    description: "Token usage, latency charts, and cost tracking across all agents",
    details: "Monitor performance trends, identify bottlenecks, and optimize costs with comprehensive analytics dashboards."
  },
  {
    icon: Search,
    title: "Prompt & Response Diffs",
    description: "Compare different versions of prompts and responses side-by-side",
    details: "Track changes in agent behavior over time and understand the impact of prompt modifications."
  },
  {
    icon: Download,
    title: "Export as Notebook",
    description: "Export traces and replays as Jupyter notebooks for analysis",
    details: "Take your observability data into your favorite analysis tools for deeper insights and custom reporting."
  }
];

const metrics = [
  {
    label: "Avg Response Time",
    value: "1.2s",
    change: "-15%",
    trend: "up"
  },
  {
    label: "Token Usage",
    value: "2.4K",
    change: "+8%",
    trend: "down"
  },
  {
    label: "Success Rate",
    value: "99.7%",
    change: "+0.3%",
    trend: "up"
  },
  {
    label: "Cost per Run",
    value: "$0.02",
    change: "-12%",
    trend: "up"
  }
];

export default function ObservabilityPage() {
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
              Deep Observability
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              From mystery to metrics. Trace every agent execution, replay with different parameters, and optimize with confidence.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Eye className="w-5 h-5 mr-2" />
                View Dashboard
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

      {/* Metrics Overview */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Real-time Metrics
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Monitor performance and costs across all your agents
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
                    <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
                    <div className="text-sm text-muted-foreground mb-2">{metric.label}</div>
                    <div className={`text-sm flex items-center justify-center ${
                      metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {metric.change}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Observability Features
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Everything you need to understand and optimize your agents
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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

      {/* Trace Example */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Trace Timeline Example
              </h2>
              <p className="text-xl text-muted-foreground">
                See exactly how your agent processes each request
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-ai-primary/20">
                <CardHeader>
                  <CardTitle className="text-white">Customer Support Agent - Request #12345</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Total execution time: 1.2s | Tokens used: 2,340 | Cost: $0.023
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Timeline steps */}
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="flex-1">
                        <div className="text-white font-semibold">Input Processing</div>
                        <div className="text-sm text-muted-foreground">0.1s | 45 tokens</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div className="flex-1">
                        <div className="text-white font-semibold">Intent Classification</div>
                        <div className="text-sm text-muted-foreground">0.3s | 120 tokens</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <div className="flex-1">
                        <div className="text-white font-semibold">Knowledge Base Query</div>
                        <div className="text-sm text-muted-foreground">0.4s | 890 tokens</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <div className="flex-1">
                        <div className="text-white font-semibold">Response Generation</div>
                        <div className="text-sm text-muted-foreground">0.3s | 1,285 tokens</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="flex-1">
                        <div className="text-white font-semibold">Output Validation</div>
                        <div className="text-sm text-muted-foreground">0.1s | 0 tokens</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
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
              Start Observing Your Agents
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Get deep insights into your agent performance and optimize for better results.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Eye className="w-5 h-5 mr-2" />
                View Dashboard
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
