"use client";

import { useState } from "react";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { UserMenu, MobileUserMenu } from "./UserMenu";
import { 
  Menu, 
  X, 
  Bot,
  Zap,
  Globe,
  Upload,
  DollarSign
} from "lucide-react";

// Simplified navigation focused on core features
const mainMenuItems = [
  {
    label: "Connect Agent",
    href: "/upload",
    icon: Bot,
    description: "Connect your AI agents via webhook"
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
                  Connect Agent
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
            <Suspense fallback={<div className="w-32 h-8 bg-gray-800 rounded animate-pulse" />}>
              <UserMenu />
            </Suspense>
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
              {/* User Authentication */}
              <Suspense fallback={<div className="px-4 py-2"><div className="w-full h-16 bg-gray-800 rounded animate-pulse" /></div>}>
                <MobileUserMenu />
              </Suspense>
              
              <div className="flex space-x-2 px-4 mt-4">
                <Link href="/upload" className="flex-1">
                  <Button size="sm" className="w-full bg-gradient-ai hover:bg-gradient-ai/90">
                    <Upload className="w-4 h-4 mr-2" />
                    Connect Agent
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