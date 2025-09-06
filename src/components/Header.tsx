"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  Search, 
  Upload, 
  BookOpen, 
  Bot,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Zap,
  Eye,
  Shield,
  Plug,
  Lock,
  Building,
  Users,
  Code,
  FileText,
  Calendar,
  Globe,
  ArrowRight
} from "lucide-react";

const megaMenuItems = [
  {
    label: "Product",
    href: "/product",
    icon: Zap,
    description: "AI Agent Platform",
    children: [
      {
        title: "Agent Builder",
        description: "Visual orchestration and versioned agents",
        href: "/product/builder",
        icon: Code
      },
      {
        title: "Observability",
        description: "Deep monitoring and analytics",
        href: "/product/observability",
        icon: Eye
      },
      {
        title: "Guardrails",
        description: "Security and compliance controls",
        href: "/product/guardrails",
        icon: Shield
      },
      {
        title: "Integrations",
        description: "Connect with your existing tools",
        href: "/product/integrations",
        icon: Plug
      },
      {
        title: "Security",
        description: "Enterprise-grade security features",
        href: "/product/security",
        icon: Lock
      }
    ]
  },
  {
    label: "Solutions",
    href: "/solutions",
    icon: Building,
    description: "Industry Solutions",
    children: [
      {
        title: "Customer Support",
        description: "Automated support with human oversight",
        href: "/solutions/customer-support",
        icon: Users
      },
      {
        title: "Sales & RevOps",
        description: "Lead processing and revenue operations",
        href: "/solutions/sales-revops",
        icon: Zap
      },
      {
        title: "Knowledge Concierge",
        description: "Intelligent knowledge management",
        href: "/solutions/knowledge-concierge",
        icon: BookOpen
      },
      {
        title: "Content QA",
        description: "Automated content quality assurance",
        href: "/solutions/content-qa",
        icon: FileText
      }
    ]
  },
  {
    label: "Enterprise",
    href: "/enterprise",
    icon: Building,
    description: "Enterprise Solutions",
    children: [
      {
        title: "Overview",
        description: "Enterprise-grade AI agent platform",
        href: "/enterprise/overview",
        icon: Building
      },
      {
        title: "Deployment",
        description: "Flexible deployment options",
        href: "/enterprise/deployment",
        icon: Globe
      },
      {
        title: "Compliance",
        description: "SOC 2, ISO 27001, HIPAA compliance",
        href: "/enterprise/compliance",
        icon: Shield
      },
      {
        title: "Security Questionnaire",
        description: "Enterprise security assessment",
        href: "/enterprise/security-questionnaire",
        icon: Lock
      }
    ]
  },
  {
    label: "Developers",
    href: "/developers",
    icon: Code,
    description: "Developer Resources",
    children: [
      {
        title: "Documentation",
        description: "Complete API and SDK documentation",
        href: "/developers/docs",
        icon: FileText
      },
      {
        title: "Quickstarts",
        description: "Get started in minutes",
        href: "/developers/quickstarts",
        icon: Zap
      },
      {
        title: "API Reference",
        description: "REST API documentation",
        href: "/developers/api",
        icon: Code
      },
      {
        title: "CLI Tools",
        description: "Command-line interface",
        href: "/developers/cli",
        icon: Code
      }
    ]
  },
  {
    label: "Resources",
    href: "/resources",
    icon: BookOpen,
    description: "Learning & Support",
    children: [
      {
        title: "Blog",
        description: "Latest insights and updates",
        href: "/resources/blog",
        icon: FileText
      },
      {
        title: "Case Studies",
        description: "Real-world success stories",
        href: "/resources/case-studies",
        icon: Users
      },
      {
        title: "Webinars",
        description: "Live and recorded sessions",
        href: "/resources/webinars",
        icon: Calendar
      },
      {
        title: "Events",
        description: "Conferences and meetups",
        href: "/resources/events",
        icon: Calendar
      },
      {
        title: "Status",
        description: "System status and uptime",
        href: "/resources/status",
        icon: Globe
      }
    ]
  }
];

const simpleMenuItems = [
  {
    label: "Pricing",
    href: "/pricing"
  },
  {
    label: "Roadmap",
    href: "/roadmap"
  },
  {
    label: "Changelog",
    href: "/changelog"
  }
];

export default function Header() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-ai-primary to-ai-secondary rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Xeinst</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {megaMenuItems.map((item) => (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => setActiveMegaMenu(item.label)}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center space-x-1 text-muted-foreground hover:text-white transition-colors"
                >
                  <span>{item.label}</span>
                  <ChevronDown className="w-4 h-4" />
                </Link>
                
                {/* Mega Menu Dropdown */}
                {activeMegaMenu === item.label && (
                  <div className="absolute top-full left-0 mt-2 w-96 bg-background border border-border rounded-lg shadow-lg p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-white mb-1">{item.label}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {item.children.map((child, index) => (
                        <Link
                          key={index}
                          href={child.href}
                          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <child.icon className="w-5 h-5 text-ai-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-white group-hover:text-ai-primary transition-colors">
                              {child.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {child.description}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Simple Menu Items */}
            {simpleMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <Link href="/pricing">
                <Button variant="outline" size="sm" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                  Pricing
                </Button>
              </Link>
              <Link href="/developers/docs">
                <Button size="sm" className="bg-gradient-ai hover:bg-gradient-ai/90">
                  <Code className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              </Link>
            </div>

            {/* User Menu */}
            {session ? (
              <div className="relative group">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-ai-primary to-ai-secondary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-white">{session.user?.name || session.user?.email}</span>
                </Button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-white hover:bg-muted">
                      <Settings className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="flex items-center w-full px-4 py-2 text-sm text-muted-foreground hover:text-white hover:bg-muted"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-gradient-ai hover:bg-gradient-ai/90">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-muted-foreground hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <nav className="space-y-2">
              {/* Mega Menu Items */}
              {megaMenuItems.map((item) => (
                <div key={item.label} className="space-y-1">
                  <Link
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-2 text-muted-foreground hover:text-white hover:bg-muted rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </Link>
                  {/* Mobile Submenu */}
                  <div className="ml-8 space-y-1">
                    {item.children.slice(0, 3).map((child, index) => (
                      <Link
                        key={index}
                        href={child.href}
                        className="flex items-center space-x-2 px-4 py-1 text-sm text-muted-foreground hover:text-white hover:bg-muted rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <child.icon className="w-4 h-4" />
                        <span>{child.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Simple Menu Items */}
              {simpleMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-2 text-muted-foreground hover:text-white hover:bg-muted rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="font-medium">{item.label}</div>
                </Link>
              ))}
            </nav>
            
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex space-x-2 px-4">
                <Link href="/pricing" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                    Pricing
                  </Button>
                </Link>
                <Link href="/developers/docs" className="flex-1">
                  <Button size="sm" className="w-full bg-gradient-ai hover:bg-gradient-ai/90">
                    <Code className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 