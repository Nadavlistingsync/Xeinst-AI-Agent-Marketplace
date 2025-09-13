"use client";
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Bot, Upload, CreditCard, User, Menu } from 'lucide-react';

export default function MarketplaceNav() {
  const { data: session } = useSession();

  return (
    <>
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 h-full w-64 bg-black/80 backdrop-blur-md border-r border-white/10 z-40">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Xeinst</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-6">
            <div className="space-y-2">
              <Link
                href="/marketplace"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-400/20 to-blue-500/20 text-white border border-cyan-400/30"
              >
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="font-medium">Marketplace</span>
              </Link>
              
              <Link
                href="/upload"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Agent</span>
              </Link>
              
              <Link
                href="/dashboard"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                href="/pricing"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <CreditCard className="w-5 h-5" />
                <span>Pricing</span>
              </Link>
            </div>
          </nav>

          {/* Credits Display */}
          <div className="p-6 border-t border-white/10">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Credits</div>
              <div className="text-2xl font-bold text-white">1,250</div>
            </div>
          </div>

          {/* User Section */}
          <div className="p-6 border-t border-white/10">
            {session ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {session.user?.name || session.user?.email}
                  </div>
                </div>
                <Link
                  href="/api/auth/signout"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Menu className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <Link
                href="/api/auth/signin"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-medium hover:from-cyan-500 hover:to-blue-600 transition-all"
              >
                <User className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-64 right-0 z-30 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="h-16 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-white">AI Agent Marketplace</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Add any top-level actions here */}
          </div>
        </div>
      </nav>
    </>
  );
} 