'use client';

import FeaturedAgents from '@/components/FeaturedAgents';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Link from 'next/link';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <p className="text-gray-600">{error.message}</p>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 pt-28 pb-8">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-black shadow-xl mb-20 p-10 flex flex-col items-center justify-center text-center min-h-[350px]">
        <div className="absolute inset-0 opacity-20 pointer-events-none select-none" style={{background: 'url(/ai-hero-bg.svg) center/cover no-repeat'}} />
        <h1 className="relative z-10 text-4xl md:text-6xl font-extrabold mb-4 text-white drop-shadow-lg">
          Welcome to <span className="text-blue-400">AI Agent Marketplace</span>
        </h1>
        <p className="relative z-10 text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-8">
          Discover and deploy powerful AI agents to automate your tasks and enhance your productivity.
        </p>
        <Link
          href="/marketplace"
          className="relative z-10 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 text-lg mt-2"
        >
          Explore Marketplace
        </Link>
        <div className="relative z-10 mt-8">
          <svg width="80" height="80" fill="none" viewBox="0 0 80 80"><circle cx="40" cy="40" r="38" stroke="#60A5FA" strokeWidth="4" fill="#1e293b" /><path d="M40 20v20l14 8" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </section>

      {/* Featured & Trending Agents */}
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingFallback />}>
          <FeaturedAgents />
        </Suspense>
      </ErrorBoundary>

      {/* Why Choose Section */}
      <section className="mt-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Why Choose Our Platform?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <div className="p-8 bg-gradient-to-br from-blue-900 via-blue-800 to-black rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-blue-900">
            <h3 className="text-xl font-semibold mb-2 text-blue-400">Verified Agents</h3>
            <p className="text-white/80">
              All agents are thoroughly tested and verified for quality and performance.
            </p>
          </div>
          <div className="p-8 bg-gradient-to-br from-blue-900 via-blue-800 to-black rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-blue-900">
            <h3 className="text-xl font-semibold mb-2 text-blue-400">Easy Integration</h3>
            <p className="text-white/80">
              Simple deployment process with comprehensive documentation and support.
            </p>
          </div>
          <div className="p-8 bg-gradient-to-br from-blue-900 via-blue-800 to-black rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-blue-900">
            <h3 className="text-xl font-semibold mb-2 text-blue-400">Community Driven</h3>
            <p className="text-white/80">
              Join a growing community of developers and users sharing their experiences.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
