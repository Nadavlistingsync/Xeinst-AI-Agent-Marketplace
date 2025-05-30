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
          className="mb-6"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-4">
            🚀 Next-Gen AI Solutions
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
        >
          Transform Your Business with
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"> AI Solutions</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          We help businesses leverage cutting-edge AI technology to drive growth, efficiency, and innovation.
          Start your AI journey today.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center"
        >
          <a
            href="#contact"
            className="group inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 md:py-4 md:text-lg md:px-10 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#features"
            className="group inline-flex items-center justify-center px-8 py-4 border border-blue-500/20 text-base font-medium rounded-lg text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 md:py-4 md:text-lg md:px-10 transition-all duration-300"
          >
            Explore Features
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-gray-400"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <span>4.9/5 Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <span>1000+ Users</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span>24/7 Support</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 