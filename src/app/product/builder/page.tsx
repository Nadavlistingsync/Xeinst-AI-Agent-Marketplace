"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Code, 
  Play, 
  ArrowRight,
  Zap,
  Shield,
  GitBranch,
  TestTube,
  Layers,
  CheckCircle,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const features = [
  {
    icon: Code,
    title: "Deterministic Outputs",
    description: "JSON Schema validation ensures consistent, typed responses every time",
    details: "Define exact output structures with JSON Schema. No more unpredictable responses or parsing errors."
  },
  {
    icon: GitBranch,
    title: "Versioning & Release Channels",
    description: "Dev, canary, and production channels with seamless promotion",
    details: "Test changes safely in dev, validate in canary, then promote to production with confidence."
  },
  {
    icon: TestTube,
    title: "Evaluation Sets & A/B Testing",
    description: "Test prompts and tools systematically with automated evaluation",
    details: "Run comprehensive tests on your agents with custom evaluation metrics and A/B testing capabilities."
  },
  {
    icon: Layers,
    title: "Visual Agent Designer",
    description: "Drag-and-drop interface for building complex agent workflows",
    details: "Design sophisticated agent logic without writing code. Connect tools, add conditions, and create branching logic visually."
  }
];

const steps = [
  {
    step: "1",
    title: "Create Agent",
    description: "Define your agent's role, personality, and capabilities",
    icon: Sparkles
  },
  {
    step: "2", 
    title: "Attach Tools",
    description: "Connect APIs, databases, and external services",
    icon: Zap
  },
  {
    step: "3",
    title: "Test & Validate",
    description: "Run test cases and validate outputs with schemas",
    icon: TestTube
  },
  {
    step: "4",
    title: "Version & Deploy",
    description: "Create versions and deploy to production channels",
    icon: GitBranch
  }
];

export default function BuilderPage() {
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
              Agent Builder
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Design, test, and deploy production-ready AI agents with visual tools and deterministic outputs.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Play className="w-5 h-5 mr-2" />
                Try Builder
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <Code className="w-5 h-5 mr-2" />
                View Documentation
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
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
              Build agents in four simple steps
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-6 mx-auto">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm text-ai-primary font-semibold mb-2">Step {step.step}</div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
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
              Key Features
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Everything you need to build reliable AI agents
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

      {/* Code Example */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Deterministic Outputs with JSON Schema
              </h2>
              <p className="text-xl text-muted-foreground">
                Define exact output structures for consistent, reliable responses
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-ai-primary/20">
                <CardHeader>
                  <CardTitle className="text-white">Example: Customer Support Agent</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Schema ensures consistent response format
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-black/50 rounded-lg p-6 font-mono text-sm overflow-x-auto">
                    <div className="text-green-400">// Output Schema</div>
                    <div className="text-blue-400">{"{"}</div>
                    <div className="ml-4 text-yellow-400">"type": "object",</div>
                    <div className="ml-4 text-yellow-400">"properties": {"{"}</div>
                    <div className="ml-8 text-purple-400">"priority": {"{"}</div>
                    <div className="ml-12 text-yellow-400">"type": "string",</div>
                    <div className="ml-12 text-yellow-400">"enum": ["low", "medium", "high", "urgent"]</div>
                    <div className="ml-8 text-purple-400">{"}"},</div>
                    <div className="ml-8 text-purple-400">"response": {"{"}</div>
                    <div className="ml-12 text-yellow-400">"type": "string",</div>
                    <div className="ml-12 text-yellow-400">"maxLength": 500</div>
                    <div className="ml-8 text-purple-400">{"}"},</div>
                    <div className="ml-8 text-purple-400">"nextAction": {"{"}</div>
                    <div className="ml-12 text-yellow-400">"type": "string",</div>
                    <div className="ml-12 text-yellow-400">"enum": ["escalate", "resolve", "follow_up"]</div>
                    <div className="ml-8 text-purple-400">{"}"}</div>
                    <div className="ml-4 text-yellow-400">{"}"},</div>
                    <div className="ml-4 text-yellow-400">"required": ["priority", "response", "nextAction"]</div>
                    <div className="text-blue-400">{"}"}</div>
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
              Ready to Build Your First Agent?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Start building with our visual agent designer. No coding required.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Code className="w-5 h-5 mr-2" />
                Start Building
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
