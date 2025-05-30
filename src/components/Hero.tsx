'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20 animate-gradient" />
      
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 text-blue-400 text-base font-semibold mb-6 shadow-sm">
            <span role="img" aria-label="rocket" className="text-xl align-middle">🚀</span>
            Next-Gen AI Solutions
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-8 leading-tight"
        >
          Transform Your Business with
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"> AI Solutions</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-14 max-w-3xl mx-auto leading-relaxed"
        >
          We help businesses leverage cutting-edge AI technology to drive growth, efficiency, and innovation.
          Start your AI journey today.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center mb-14"
        >
          <a
            href="#contact"
            className="btn-primary text-lg font-semibold px-10 py-4 shadow-lg hover:shadow-blue-500/25 focus:shadow-blue-500/40"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#features"
            className="btn-secondary text-lg font-semibold px-10 py-4 shadow-lg hover:shadow-white/20 focus:shadow-white/30"
          >
            Explore Features
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row justify-center gap-6 mt-2"
        >
          <div className="flex flex-col items-center bg-white/10 rounded-xl px-8 py-6 shadow-md min-w-[180px]">
            <span className="text-3xl mb-2">⭐</span>
            <span className="text-2xl font-bold text-white">4.9/5</span>
            <span className="text-gray-300 text-base mt-1">Rating</span>
          </div>
          <div className="flex flex-col items-center bg-white/10 rounded-xl px-8 py-6 shadow-md min-w-[180px]">
            <span className="text-3xl mb-2">👥</span>
            <span className="text-2xl font-bold text-white">1000+</span>
            <span className="text-gray-300 text-base mt-1">Users</span>
          </div>
          <div className="flex flex-col items-center bg-white/10 rounded-xl px-8 py-6 shadow-md min-w-[180px]">
            <span className="text-3xl mb-2">🚀</span>
            <span className="text-2xl font-bold text-white">24/7</span>
            <span className="text-gray-300 text-base mt-1">Support</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 