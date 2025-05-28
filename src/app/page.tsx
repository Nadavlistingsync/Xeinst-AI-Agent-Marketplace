'use client';

import FeaturedAgents from '@/components/FeaturedAgents';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Hero from '@/components/Hero';

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
    <main className="flex flex-col gap-24 pt-24">
      {/* Modern Hero Section */}
      <Hero />

      {/* Featured & Trending Agents */}
      <section className="container">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingFallback />}>
            <div className="glass-card p-8 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white glow-text">Featured Agents</h2>
              <FeaturedAgents />
            </div>
          </Suspense>
        </ErrorBoundary>
      </section>

      {/* Why Choose Section */}
      <section className="container text-center">
        <div className="glass-card p-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white glow-text">Why Choose Our Platform?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div className="p-8 glass-card">
              <h3 className="text-xl font-semibold mb-2 text-blue-400">Verified Agents</h3>
              <p className="text-white/80">
                All agents are thoroughly tested and verified for quality and performance.
              </p>
            </div>
            <div className="p-8 glass-card">
              <h3 className="text-xl font-semibold mb-2 text-blue-400">Easy Integration</h3>
              <p className="text-white/80">
                Simple deployment process with comprehensive documentation and support.
              </p>
            </div>
            <div className="p-8 glass-card">
              <h3 className="text-xl font-semibold mb-2 text-blue-400">Community Driven</h3>
              <p className="text-white/80">
                Join a growing community of developers and users sharing their experiences.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
