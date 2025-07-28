'use client';

import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Search, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  Sparkles,
  Globe,
  Bot,
  Upload,
  Rocket,
  BookOpen,
  Home
} from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setScrolled(latest > 50);
    });
  }, [scrollY]);

  const menuItems = [
    { 
      label: 'Home', 
      href: '/',
      icon: Home,
      description: 'Back to homepage'
    },
    { 
      label: 'Browse Agents', 
      href: '/marketplace',
      icon: Search,
      description: 'Find AI agents'
    },
    { 
      label: 'Upload Agent', 
      href: '/upload',
      icon: Upload,
      description: 'Share your agent'
    },
    { 
      label: 'Deploy Agent', 
      href: '/deploy',
      icon: Rocket,
      description: 'Deploy to cloud'
    },
    { 
      label: 'Web Embeds', 
      href: '/web-embeds',
      icon: Globe,
      description: 'Embed websites'
    },
    { 
      label: 'My Dashboard', 
      href: '/dashboard',
      icon: Bot,
      description: 'Manage your agents'
    },
    { 
      label: 'How It Works', 
      href: '/guide',
      icon: BookOpen,
      description: 'Learn the basics'
    }
  ];

  const userMenuItems = [
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Settings', href: '/settings', icon: Settings },
    { label: 'Logout', href: '/logout', icon: LogOut },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-2xl' 
        : 'bg-transparent'
    }`}>
      <div className="container">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-ai rounded-xl flex items-center justify-center shadow-glow">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-ai rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gradient">AI Agency</span>
                <span className="text-xs text-muted-foreground">Build & Deploy AI</span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {menuItems.slice(1, 6).map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className="relative group px-4 py-2 text-muted-foreground hover:text-white hover:bg-ai-primary/10 transition-all duration-300"
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                    <div className="absolute inset-0 bg-gradient-ai opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
                  </Button>
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/marketplace">
                <Button size="sm" variant="outline" className="border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10">
                  <Search className="w-4 h-4 mr-2" />
                  Browse
                </Button>
              </Link>
              <Link href="/upload">
                <Button size="sm" className="bg-gradient-ai hover:bg-gradient-ai/90">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </Link>
            </div>

            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="relative group"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <User className="w-5 h-5 mr-2" />
                Account
                <ChevronDown className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:rotate-180" />
              </Button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-background/90 backdrop-blur-xl border border-border rounded-lg shadow-2xl py-2 z-50"
                  >
                    {userMenuItems.map((item) => (
                      <Link key={item.label} href={item.href}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start px-4 py-2 text-muted-foreground hover:text-white hover:bg-ai-primary/10"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-border bg-background/90 backdrop-blur-xl"
            >
              <div className="py-4 space-y-2">
                {menuItems.map((item) => (
                  <Link key={item.label} href={item.href}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-3 text-muted-foreground hover:text-white hover:bg-ai-primary/10"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    </Button>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
} 