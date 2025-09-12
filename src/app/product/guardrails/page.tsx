"use client";

import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
// import { Badge } from "../../../components/ui/badge";
import { 
  Shield, 
  Play, 
  ArrowRight,
  Zap,
  AlertTriangle,
  Eye,
  Filter,
  Settings,
  FileText,
  Database
} from "lucide-react";
import { motion } from "framer-motion";
// import Link from "next/link";

const guardrailTypes = [
  {
    icon: FileText,
    title: "Policy Packs",
    description: "Pre-built policies for PII, PHI, and compliance requirements",
    details: "Ready-to-use policy packs that automatically detect and handle sensitive information according to industry standards."
  },
  {
    icon: Filter,
    title: "Content Filters",
    description: "Block inappropriate, harmful, or off-topic content",
    details: "Multi-layered content filtering that prevents your agents from generating or processing inappropriate content."
  },
  {
    icon: Database,
    title: "Tool Whitelists",
    description: "Control which tools and APIs your agents can access",
    details: "Granular control over agent capabilities with whitelist-based tool access and permission management."
  },
  {
    icon: Settings,
    title: "Function Limits",
    description: "Set rate limits, token limits, and execution timeouts",
    details: "Prevent runaway costs and ensure predictable performance with configurable limits and timeouts."
  }
];

const failSafePatterns = [
  {
    title: "Fallback LLM",
    description: "Switch to a different model when primary fails",
    icon: Zap
  },
  {
    title: "Cached Answers",
    description: "Return pre-approved responses for common queries",
    icon: Database
  },
  {
    title: "Human Review",
    description: "Escalate to human agents for complex cases",
    icon: Eye
  },
  {
    title: "Graceful Degradation",
    description: "Provide partial responses when full processing fails",
    icon: AlertTriangle
  }
];

export default function GuardrailsPage() {
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
              AI Guardrails
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Guardrails that actually prevent incidents. Policy packs, content filters, and fail-safe patterns for production-ready AI.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Shield className="w-5 h-5 mr-2" />
                Configure Guardrails
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

      {/* Guardrail Types */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Guardrail Types
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Multiple layers of protection for your AI agents
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {guardrailTypes.map((guardrail, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-4">
                      <guardrail.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white">{guardrail.title}</CardTitle>
                    <CardDescription className="text-muted-foreground text-lg">
                      {guardrail.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{guardrail.details}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fail Safe Patterns */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Fail Safe Patterns
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              "Fail safe to..." patterns for reliable agent behavior
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {failSafePatterns.map((pattern, index) => (
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
                      <pattern.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{pattern.title}</h3>
                    <p className="text-muted-foreground">{pattern.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Policy Example */}
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
                PII Detection Policy Example
              </h2>
              <p className="text-xl text-muted-foreground">
                Automatically detect and handle personally identifiable information
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-ai-primary/20">
                <CardHeader>
                  <CardTitle className="text-white">PII Policy Configuration</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Automatically redact sensitive information before processing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-black/50 rounded-lg p-6 font-mono text-sm overflow-x-auto">
                    <div className="text-green-400">{'// PII Detection Policy'}</div>
                    <div className="text-blue-400">{"{"}</div>
                    <div className="ml-4 text-yellow-400">"name": "pii-protection",</div>
                    <div className="ml-4 text-yellow-400">"version": "1.0",</div>
                    <div className="ml-4 text-yellow-400">"rules": [</div>
                    <div className="ml-8 text-purple-400">{"{"}</div>
                    <div className="ml-12 text-yellow-400">"type": "email",</div>
                    <div className="ml-12 text-yellow-400">"action": "redact",</div>
                    <div className="ml-12 text-yellow-400">"replacement": "[EMAIL]"</div>
                    <div className="ml-8 text-purple-400">{"},"},</div>
                    <div className="ml-8 text-purple-400">{"{"}</div>
                    <div className="ml-12 text-yellow-400">"type": "phone",</div>
                    <div className="ml-12 text-yellow-400">"action": "redact",</div>
                    <div className="ml-12 text-yellow-400">"replacement": "[PHONE]"</div>
                    <div className="ml-8 text-purple-400">{"},"},</div>
                    <div className="ml-8 text-purple-400">{"{"}</div>
                    <div className="ml-12 text-yellow-400">"type": "ssn",</div>
                    <div className="ml-12 text-yellow-400">"action": "block",</div>
                    <div className="ml-12 text-yellow-400">"message": "SSN detected - request blocked"</div>
                    <div className="ml-8 text-purple-400">{"}"}</div>
                    <div className="ml-4 text-yellow-400">{"]"},</div>
                    <div className="ml-4 text-yellow-400">"fail_safe": "human_review"</div>
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
              Secure Your AI Agents
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Implement comprehensive guardrails to ensure safe, reliable AI agent behavior.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Shield className="w-5 h-5 mr-2" />
                Configure Guardrails
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
