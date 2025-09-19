"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  Search, 
  Upload, 
  User, 
  Settings,
  Grid3X3,
  TrendingUp,
  Star,
  Clock,
  Tag
} from 'lucide-react';
import { cn } from '../lib/utils';

const navigationItems = [
  {
    name: 'Home',
    href: '/marketplace',
    icon: Home,
  },
  {
    name: 'Browse',
    href: '/marketplace/browse',
    icon: Grid3X3,
  },
  {
    name: 'Search',
    href: '/marketplace/search',
    icon: Search,
  },
  {
    name: 'Trending',
    href: '/marketplace/trending',
    icon: TrendingUp,
  },
  {
    name: 'Featured',
    href: '/marketplace/featured',
    icon: Star,
  },
  {
    name: 'Recent',
    href: '/marketplace/recent',
    icon: Clock,
  },
  {
    name: 'Categories',
    href: '/marketplace/categories',
    icon: Tag,
  },
];

const userItems = [
  {
    name: 'Upload',
    href: '/upload',
    icon: Upload,
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: User,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

const MarketplaceNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-black/20 backdrop-blur-md border-r border-white/10 z-40">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">X</span>
            </div>
            <span className="text-xl font-bold text-white">Xeinst</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-6 space-y-1">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
              Marketplace
            </h3>
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent text-black'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
              Account
            </h3>
            {userItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent text-black'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-white/50 text-center">
            © 2024 Xeinst
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MarketplaceNav;
