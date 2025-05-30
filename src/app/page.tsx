'use client';

import FeaturedAgents from '@/components/FeaturedAgents';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Hero from '@/components/Hero';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Users } from 'lucide-react';

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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function Home() {
  return (
    <main className="flex flex-col gap-32 pt-28">
      {/* Modern Hero Section */}
      <Hero />

      {/* Featured & Trending Agents */}
      <section className="container py-20 bg-gradient-to-b from-black via-gray-900 to-black rounded-3xl shadow-2xl border border-white/10 mb-20">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingFallback />}>
            <FeaturedAgents />
          </Suspense>
        </ErrorBoundary>
      </section>

      {/* Why Choose Section */}
      <section className="container text-center py-20 bg-black/80 rounded-3xl shadow-2xl border border-white/10">
        <motion.div
          {...fadeInUp}
          className="glass-card p-12 backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl shadow-2xl"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-14 text-white glow-text">Why Choose Our Platform?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-10 glass-card backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl hover:border-blue-500/50 transition-all duration-300 shadow-lg"
            >
              <Zap className="h-14 w-14 text-blue-400 mb-6 mx-auto" />
              <h3 className="text-2xl font-semibold mb-4 text-blue-400">Verified Agents</h3>
              <p className="text-white/80 leading-relaxed text-lg">
                All agents are thoroughly tested and verified for quality and performance.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-10 glass-card backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl hover:border-blue-500/50 transition-all duration-300 shadow-lg"
            >
              <Sparkles className="h-14 w-14 text-blue-400 mb-6 mx-auto" />
              <h3 className="text-2xl font-semibold mb-4 text-blue-400">Easy Integration</h3>
              <p className="text-white/80 leading-relaxed text-lg">
                Simple deployment process with comprehensive documentation and support.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-10 glass-card backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl hover:border-blue-500/50 transition-all duration-300 shadow-lg"
            >
              <Users className="h-14 w-14 text-blue-400 mb-6 mx-auto" />
              <h3 className="text-2xl font-semibold mb-4 text-blue-400">Community Driven</h3>
              <p className="text-white/80 leading-relaxed text-lg">
                Join a growing community of developers and users sharing their experiences.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
