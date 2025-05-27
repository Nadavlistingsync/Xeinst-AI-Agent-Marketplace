'use client';

import FeaturedAgents from '@/components/FeaturedAgents';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

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
    <main className="container mx-auto px-4 py-8">
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome to AI Agent Marketplace
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover and deploy powerful AI agents to automate your tasks and enhance your productivity.
        </p>
      </section>

      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingFallback />}>
          <FeaturedAgents />
        </Suspense>
      </ErrorBoundary>

      <section className="mt-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-2">Verified Agents</h3>
            <p className="text-gray-600">
              All agents are thoroughly tested and verified for quality and performance.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-2">Easy Integration</h3>
            <p className="text-gray-600">
              Simple deployment process with comprehensive documentation and support.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
            <p className="text-gray-600">
              Join a growing community of developers and users sharing their experiences.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
