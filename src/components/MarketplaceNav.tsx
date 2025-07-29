"use client";
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function MarketplaceNav() {
  const { data: session } = useSession();

  return (
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
  );
} 