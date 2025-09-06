"use client";

// import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Bot,
  Cpu,
  Upload,
  Lightbulb,
  Globe,
  Code,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Play,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "react-hot-toast";

// FAQ Data
// const faqData = [
//   {
//     question: "What is Xeinst?",
//     answer: "Xeinst is the premier AI agent marketplace where creators can monetize their AI solutions and users can discover powerful, ready-to-use AI agents for any task."
//   },
//   {
//     question: "How do I create and sell AI agents?",
//     answer: "Simply upload your AI agent through our platform, set your pricing, and start earning. We handle hosting, payments, and customer support."
//   },
//   {
//     question: "What types of AI agents can I sell?",
//     answer: "You can sell any type of AI agent: chatbots, data analysis tools, content generators, automation scripts, and more. The possibilities are endless."
//   },
//   {
//     question: "How much can I earn as a creator?",
//     answer: "Creators typically earn 70-85% of each sale, with top creators making $10,000+ monthly. Your earnings depend on agent quality and marketing."
//   },
//   {
//     question: "Is there a free trial available?",
//     answer: "Yes! Most agents offer free trials or demos. You can test agents before purchasing to ensure they meet your needs."
//   },
//   {
//     question: "What support do you provide?",
//     answer: "We provide 24/7 technical support, documentation, tutorials, and a community forum to help you succeed."
//   }
// ];

// Testimonials Data
// const testimonials = [
//   {
//     name: "Sarah Chen",
//     role: "AI Developer",
//     company: "TechFlow Solutions",
//     content: "Xeinst helped me monetize my AI agents and reach customers worldwide. The platform is incredibly user-friendly and the support is outstanding.",
//     rating: 5,
//     avatar: "SC"
//   },
//   {
//     name: "Marcus Rodriguez",
//     role: "Business Owner",
//     company: "Digital Dynamics",
//     content: "I found the perfect AI agent for my customer service needs on Xeinst. It saved me months of development time and works flawlessly.",
//     rating: 5,
//     avatar: "MR"
//   },
//   {
//     name: "Emily Watson",
//     role: "Marketing Director",
//     company: "Growth Labs",
//     content: "The affiliate program is fantastic. I'm earning passive income by promoting quality AI agents to my network. Highly recommended!",
//     rating: 5,
//     avatar: "EW"
//   }
// ];

// Features Data
const features = [
  {
    icon: Code,
    title: "Agent Builder",
    description: "Design agents with roles, tools, memory, and evaluation sets",
    color: "from-blue-500 to-purple-500"
  },
  {
    icon: Cpu,
    title: "Orchestration Canvas",
    description: "Visual workflow with branching, scheduled runs, and human-in-the-loop",
    color: "from-green-500 to-teal-500"
  },
  {
    icon: Globe,
    title: "Integrations",
    description: "Make/N8N bridges, 100+ apps via native connectors",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Shield,
    title: "Governance",
    description: "RBAC, audit logs, PII scrubbing, and policy enforcement",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Upload,
    title: "Deploy",
    description: "Webhooks, cron, events, queues, serverless targets, VPC",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Zap,
    title: "Observability",
    description: "Traces, replays, metrics, and deterministic outputs",
    color: "from-indigo-500 to-blue-500"
  }
];

// How It Works Steps
const howItWorksSteps = [
  {
    step: "01",
    title: "Design on the Canvas",
    description: "Visual nodes: triggers, tools, agents, code",
    icon: Code,
    color: "from-blue-500 to-purple-500"
  },
  {
    step: "02",
    title: "Guardrail with Policies",
    description: "Schemas, sandboxes, and safety policies",
    icon: Shield,
    color: "from-green-500 to-teal-500"
  },
  {
    step: "03",
    title: "Observe & Improve",
    description: "Traces, replays, and evaluation sets",
    icon: Zap,
    color: "from-orange-500 to-red-500"
  }
];

// Stats
const stats = [
  { label: "Uptime", value: "99.9%", icon: Shield },
  { label: "Avg Exec Time", value: "<2s", icon: Zap },
  { label: "Active Agents", value: "10K+", icon: Bot },
  { label: "Cost Control", value: "Built-in", icon: DollarSign }
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual Supabase integration
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        toast.success("You've been added to the waitlist! We'll notify you when we launch.");
        setEmail("");
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                Coming Soon - Join the Waitlist
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-gradient mb-6"
            >
              Build dependable AI agents.
              <br />
              <span className="text-white">Deploy in hours, govern for scale.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Visual orchestration + versioned agents, guardrails, and deep observability. Ship AI agents your ops team can trust—without brittle scripts.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                <Play className="w-5 h-5 mr-2" />
                Book a Demo
              </Button>
              <Button size="lg" variant="ghost" className="text-muted-foreground hover:text-white">
                See Templates
              </Button>
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

      {/* How It Works Section */}
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
              Three steps to production-ready AI agents
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center mb-4 mx-auto`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-sm text-ai-primary font-semibold mb-2">{step.step}</div>
                    <CardTitle className="text-xl text-white">{step.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
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
              Everything you need to build, sell, and use AI agents
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
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

      {/* Use Cases Section */}
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
              Production-ready AI agents for every business function
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white">Customer Support</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Auto-triage support → draft reply → ticket updates
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white">Sales & RevOps</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Lead routing & enrichment → CRM hygiene
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-4">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white">Knowledge Concierge</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Onboarding assistance and knowledge management
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white">Content QA</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Compliance checks and quality assurance
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="py-20 bg-gradient-to-b from-background to-background/50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Start Building Your First Agent
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Deploy in 10 minutes. No credit card required.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-md mx-auto"
            >
              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-background/50 border-ai-primary/20 text-white placeholder:text-muted-foreground"
                    required
                  />
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-gradient-ai hover:bg-gradient-ai/90"
                  >
                    {isSubmitting ? "Starting..." : "Start Free"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get started instantly. No credit card required.
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
