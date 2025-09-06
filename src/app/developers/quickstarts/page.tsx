"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Play, 
  ArrowRight,
  Code,
  Clock,
  CheckCircle,
  ExternalLink,
  Copy,
  MessageSquare,
  FileText,
  Lightbulb,
  Globe,
  Database
} from "lucide-react";
import { motion } from "framer-motion";
// import Link from "next/link";
import { useState } from "react";

const quickstarts = [
  {
    title: "Your First AI Agent",
    description: "Build and deploy your first AI agent in 10 minutes",
    duration: "10 min",
    difficulty: "Beginner",
    icon: Zap,
    color: "from-blue-500 to-purple-500",
    steps: [
      "Create a new agent",
      "Define the agent's role and personality",
      "Add basic tools and integrations",
      "Test the agent locally",
      "Deploy to production"
    ],
    codeExample: `// Create a new agent
const agent = await xeinst.agents.create({
  name: "Customer Support Agent",
  role: "Help customers with their questions",
  tools: ["web_search", "knowledge_base"],
  schema: {
    type: "object",
    properties: {
      response: { type: "string" },
      confidence: { type: "number" }
    }
});`
  },
  {
    title: "Webhook Integration",
    description: "Trigger agents via HTTP webhooks",
    duration: "15 min",
    difficulty: "Beginner",
    icon: Globe,
    color: "from-green-500 to-teal-500",
    steps: [
      "Set up webhook endpoint",
      "Configure agent to handle webhook data",
      "Test webhook with sample data",
      "Deploy and monitor webhook",
      "Handle errors and retries"
    ],
    codeExample: `// Webhook handler
app.post('/webhook', async (req, res) => {
  const { message, userId } = req.body;
  
  const response = await agent.run({
    input: message,
    context: { userId }
  });
  
  res.json({ response: response.output });
});`
  },
  {
    title: "Make.com Integration",
    description: "Use agents in Make.com scenarios",
    duration: "20 min",
    difficulty: "Intermediate",
    icon: Database,
    color: "from-orange-500 to-red-500",
    steps: [
      "Connect Xeinst to Make.com",
      "Create a new scenario",
      "Add Xeinst Agent module",
      "Configure input and output mapping",
      "Test and deploy scenario"
    ],
    codeExample: `// Make.com scenario configuration
{
  "module": "xeinst_agent",
  "agent_id": "agent_123",
  "input_mapping": {
    "message": "{{1.message}}",
    "context": "{{1.user_data}}"
  },
  "output_mapping": {
    "response": "{{response}}",
    "confidence": "{{confidence}}"
  }
}`
  },
  {
    title: "JSON Schema Validation",
    description: "Ensure deterministic outputs with JSON Schema",
    duration: "12 min",
    difficulty: "Intermediate",
    icon: FileText,
    color: "from-purple-500 to-pink-500",
    steps: [
      "Define output schema",
      "Configure agent with schema",
      "Test schema validation",
      "Handle validation errors",
      "Deploy with schema enforcement"
    ],
    codeExample: `// Define output schema
const schema = {
  type: "object",
  properties: {
    answer: { type: "string" },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    sources: { type: "array", items: { type: "string" } }
  },
  required: ["answer", "confidence"]
};

// Configure agent
const agent = await xeinst.agents.create({
  name: "Research Agent",
  outputSchema: schema
});`
  }
];

const prerequisites = [
  {
    title: "Xeinst Account",
    description: "Sign up for a free Xeinst account",
    icon: CheckCircle,
    completed: true
  },
  {
    title: "Node.js 18+",
    description: "Install Node.js for local development",
    icon: Code,
    completed: false
  },
  {
    title: "API Key",
    description: "Get your API key from the dashboard",
    icon: Globe,
    completed: false
  },
  {
    title: "Basic JavaScript",
    description: "Familiarity with JavaScript/TypeScript",
    icon: Lightbulb,
    completed: false
  }
];

const nextSteps = [
  {
    title: "Advanced Agent Configuration",
    description: "Learn about memory, context, and advanced features",
    icon: Code,
    link: "/docs/building-agents"
  },
  {
    title: "Integration Patterns",
    description: "Common integration patterns and best practices",
    icon: Globe,
    link: "/docs/integrations"
  },
  {
    title: "Deployment Options",
    description: "Deploy agents to different environments",
    icon: Database,
    link: "/docs/deployment"
  },
  {
    title: "Monitoring & Observability",
    description: "Monitor agent performance and debug issues",
    icon: MessageSquare,
    link: "/docs/observability"
  }
];

export default function QuickstartsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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
              Quickstarts
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Get up and running with Xeinst in minutes. Choose a quickstart guide 
              and start building AI agents right away.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Zap className="w-5 h-5 mr-2" />
                Start Building
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <Play className="w-5 h-5 mr-2" />
                Watch Tutorial
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Prerequisites */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Prerequisites
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              What you need before getting started
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {prerequisites.map((prereq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className={`text-center hover:shadow-lg transition-all duration-300 ${
                  prereq.completed 
                    ? 'border-green-500/20 bg-green-500/5' 
                    : 'border-ai-primary/20 hover:border-ai-primary/40'
                }`}>
                  <CardContent className="pt-6">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${
                      prereq.completed 
                        ? 'bg-green-500' 
                        : 'bg-gradient-to-r from-ai-primary to-ai-secondary'
                    }`}>
                      <prereq.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{prereq.title}</h3>
                    <p className="text-muted-foreground text-sm">{prereq.description}</p>
                    {prereq.completed && (
                      <Badge variant="secondary" className="mt-3 bg-green-500/10 text-green-500 border-green-500/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Ready
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quickstart Guides */}
      <section className="py-20 bg-gradient-to-b from-background/50 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Quickstart Guides
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Choose a quickstart guide to get started
            </motion.p>
          </div>

          <div className="space-y-12">
            {quickstarts.map((quickstart, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-ai-primary/20 hover:border-ai-primary/40 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${quickstart.color} flex items-center justify-center`}>
                        <quickstart.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <CardTitle className="text-2xl text-white">{quickstart.title}</CardTitle>
                          <div className="flex space-x-2">
                            <Badge variant="outline" className="border-ai-primary/20 text-ai-primary">
                              <Clock className="w-3 h-3 mr-1" />
                              {quickstart.duration}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`${
                                quickstart.difficulty === 'Beginner' 
                                  ? 'border-green-500/20 text-green-500'
                                  : 'border-yellow-500/20 text-yellow-500'
                              }`}
                            >
                              {quickstart.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription className="text-muted-foreground text-lg">
                          {quickstart.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Steps */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Steps</h4>
                        <ol className="space-y-3">
                          {quickstart.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start space-x-3">
                              <div className="w-6 h-6 rounded-full bg-ai-primary text-white text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                                {stepIndex + 1}
                              </div>
                              <span className="text-muted-foreground">{step}</span>
                            </li>
                          ))}
                        </ol>
                        <Button className="mt-6 bg-gradient-ai hover:bg-gradient-ai/90">
                          Start This Quickstart
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>

                      {/* Code Example */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-white">Code Example</h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(quickstart.codeExample, `code-${index}`)}
                            className="text-ai-primary hover:text-white"
                          >
                            {copiedCode === `code-${index}` ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <div className="bg-black/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                          <pre className="text-green-400">{quickstart.codeExample}</pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              What's Next?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Continue your learning journey with these advanced topics
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {nextSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40 cursor-pointer">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-white">{step.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Learn More
                    </Button>
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
              Ready to Build?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Start building your first AI agent today. No credit card required.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Zap className="w-5 h-5 mr-2" />
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <MessageSquare className="w-5 h-5 mr-2" />
                Join Developer Community
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
