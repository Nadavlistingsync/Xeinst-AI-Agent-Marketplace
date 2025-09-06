"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  Bot,
  Settings,
  User,
  LogOut,
  Zap,
  Globe,
  Upload,
  DollarSign
} from "lucide-react";

// Simplified navigation focused on core features
const mainMenuItems = [
  {
    label: "Upload Agent",
    href: "/upload",
    icon: Bot,
    description: "Upload and deploy your AI agents"
  },
  {
    label: "Marketplace",
    href: "/marketplace",
    icon: Globe,
    description: "Discover and use AI agents"
  },
  {
    label: "Credits",
    href: "/checkout",
    icon: Zap,
    description: "Buy credits to use agents"
  }
];

const simpleMenuItems = [
  {
    label: "Dashboard",
    href: "/dashboard"
  },
  {
    label: "Pricing",
    href: "/pricing"
  }
];

export default function Header() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            {/* Main Menu Items */}
            {mainMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 text-muted-foreground hover:text-white transition-colors group"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
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
              <Link href="/upload">
                <Button size="sm" className="bg-gradient-ai hover:bg-gradient-ai/90">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Agent
                </Button>
              </Link>
              <Link href="/checkout">
                <Button variant="outline" size="sm" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Buy Credits
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
              {/* Main Menu Items */}
              {mainMenuItems.map((item) => (
                <Link
                  key={item.href}
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
                <Link href="/upload" className="flex-1">
                  <Button size="sm" className="w-full bg-gradient-ai hover:bg-gradient-ai/90">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Agent
                  </Button>
                </Link>
                <Link href="/checkout" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Buy Credits
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