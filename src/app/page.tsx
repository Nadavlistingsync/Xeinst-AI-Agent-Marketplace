'use client';

// Triggering new deployment
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  MessageSquare, 
  Target, 
  CheckCircle2,
  Clock,
  Star,
  Building2,
  Bot,
  Store
} from 'lucide-react';
import FeaturedAgents from '@/components/FeaturedAgents';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  whileInView: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

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

      <FeaturedAgents />

      <section className="mt-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Verified Agents</h3>
            <p className="text-gray-600">
              All agents are thoroughly tested and verified for quality and performance.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Easy Integration</h3>
            <p className="text-gray-600">
              Simple deployment process with comprehensive documentation and support.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg">
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
