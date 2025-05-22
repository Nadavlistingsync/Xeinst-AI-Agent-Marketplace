"use client";
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Navigation */}
      <nav className="bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-white font-bold text-xl">
                AI Agency
              </Link>
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/marketplace"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Marketplace
                </Link>
                {session && (
                  <Link
                    href="/deploy"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Deploy Agent
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center">
              {session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300 text-sm">
                    {session.user?.email}
                  </span>
                  <Link
                    href="/api/auth/signout"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Out
                  </Link>
                </div>
              ) : (
                <Link
                  href="/api/auth/signin"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-md border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2024 AI Agency. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white text-sm"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white text-sm"
              >
                Privacy
              </Link>
              <Link
                href="/contact"
                className="text-gray-400 hover:text-white text-sm"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 