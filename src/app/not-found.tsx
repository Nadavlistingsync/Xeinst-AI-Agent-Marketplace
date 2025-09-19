"use client";

import { Button } from "../components/ui";
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { 
  Home, 
  ArrowLeft,
  Search,
  Bot,
  Code,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const quickLinks = [
  {
    title: "Agent Builder",
    description: "Build and deploy AI agents",
    href: "/product/builder",
    icon: Bot
  },
  {
    title: "Observability",
    description: "Monitor agent performance",
    href: "/product/observability",
    icon: Search
  },
  {
    title: "Guardrails",
    description: "Secure your AI agents",
    href: "/product/guardrails",
    icon: Shield
  },
  {
    title: "Documentation",
    description: "Developer resources",
    href: "/developers/docs",
    icon: Code
  }
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center">
          {/* 404 Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="text-8xl md:text-9xl font-bold text-gradient mb-4">
              404
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-ai-primary to-ai-secondary mx-auto rounded-full"></div>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Page Not Found
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back on track with Xeinst.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/">
              <Button size="lg" className="bg-gradient-ai hover:bg-gradient-ai/90">
                <Home className="w-5 h-5 mr-2" />
                Go Home
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">
              Popular Pages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                >
                  <Link href={link.href}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 border-ai-primary/20 hover:border-ai-primary/40 cursor-pointer">
                      <CardHeader className="text-center">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-ai-primary to-ai-secondary flex items-center justify-center mb-4 mx-auto">
                          <link.icon className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-lg text-white">{link.title}</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {link.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-16"
          >
            <p className="text-muted-foreground">
              Still can't find what you're looking for?{" "}
              <Link href="/contact" className="text-ai-primary hover:text-ai-secondary transition-colors">
                Contact our support team
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
