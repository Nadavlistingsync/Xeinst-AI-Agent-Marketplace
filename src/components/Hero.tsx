'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden animate-gradient">
      {/* Ambient visuals (optional: add Lottie or SVG background here) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-gradient-to-br from-[#00b4ff]/30 via-transparent to-purple-500/10 rounded-full blur-3xl opacity-60 animate-pulse" />
      </div>
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#00b4ff]/10 text-[#00b4ff] text-lg font-semibold mb-6 shadow-sm border border-[#00b4ff]/30">
            <span role="img" aria-label="rocket" className="text-xl align-middle">🚀</span>
            Next-Gen AI Solutions
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-white mb-8 leading-tight glow-text"
        >
          Transform Your Business with
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00b4ff] to-purple-400"> AI Solutions</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-2xl sm:text-3xl md:text-4xl text-gray-300 mb-14 max-w-3xl mx-auto leading-relaxed"
        >
          Unlock the power of custom AI. We build, deploy, and support next-gen AI agents tailored to your business—fast, secure, and scalable.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-8 justify-center mb-14"
        >
          <a
            href="#contact"
            className="btn-primary text-2xl font-bold px-14 py-5 shadow-xl hover:shadow-[#00b4ff]/40 focus:shadow-[#00b4ff]/50"
          >
            Get Started
            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#features"
            className="btn-secondary text-2xl font-bold px-14 py-5 shadow-xl hover:shadow-white/20 focus:shadow-white/30"
          >
            Explore Features
            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
        {/* Stat cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row justify-center gap-8 mt-2"
        >
          <div className="flex flex-col items-center glass-card rounded-2xl px-10 py-8 shadow-xl min-w-[200px]">
            <span className="text-4xl mb-2">⭐</span>
            <span className="text-3xl font-bold text-white">4.9/5</span>
            <span className="text-gray-300 text-lg mt-1">Rating</span>
          </div>
          <div className="flex flex-col items-center glass-card rounded-2xl px-10 py-8 shadow-xl min-w-[200px]">
            <span className="text-4xl mb-2">👥</span>
            <span className="text-3xl font-bold text-white">1000+</span>
            <span className="text-gray-300 text-lg mt-1">Users</span>
          </div>
          <div className="flex flex-col items-center glass-card rounded-2xl px-10 py-8 shadow-xl min-w-[200px]">
            <span className="text-4xl mb-2">🚀</span>
            <span className="text-3xl font-bold text-white">24/7</span>
            <span className="text-gray-300 text-lg mt-1">Support</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 