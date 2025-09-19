"use client";

import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Mail, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black/50 backdrop-blur-md border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">X</span>
              </div>
              <span className="text-xl font-bold text-white">Xeinst</span>
            </div>
            <p className="text-white/70 text-sm">
              The premier marketplace for AI agents. Create, deploy, and monetize your automation solutions.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" className="text-white/70 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" className="text-white/70 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="mailto:support@xeinst.com" className="text-white/70 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <div className="space-y-2">
              <Link href="/marketplace" className="block text-white/70 hover:text-white text-sm transition-colors">
                Marketplace
              </Link>
              <Link href="/upload" className="block text-white/70 hover:text-white text-sm transition-colors">
                Upload Agent
              </Link>
              <Link href="/pricing" className="block text-white/70 hover:text-white text-sm transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="block text-white/70 hover:text-white text-sm transition-colors">
                Documentation
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <div className="space-y-2">
              <Link href="/about" className="block text-white/70 hover:text-white text-sm transition-colors">
                About
              </Link>
              <Link href="/contact" className="block text-white/70 hover:text-white text-sm transition-colors">
                Contact
              </Link>
              <Link href="/careers" className="block text-white/70 hover:text-white text-sm transition-colors">
                Careers
              </Link>
              <Link href="/blog" className="block text-white/70 hover:text-white text-sm transition-colors">
                Blog
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <div className="space-y-2">
              <Link href="/privacy" className="block text-white/70 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-white/70 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/security" className="block text-white/70 hover:text-white text-sm transition-colors">
                Security
              </Link>
              <Link href="/cookies" className="block text-white/70 hover:text-white text-sm transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/50 text-sm">
            © 2024 Xeinst. All rights reserved.
          </p>
          <p className="text-white/50 text-sm flex items-center mt-4 md:mt-0">
            Made with <Heart className="h-4 w-4 mx-1 text-red-400" /> for the AI community
          </p>
        </div>
      </div>
    </footer>
  );
};
