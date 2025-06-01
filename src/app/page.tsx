'use client';

import Image from 'next/image';
import { FeaturedAgents } from '@/components/FeaturedAgents';
import * as Sentry from '@sentry/nextjs';

export default function Home() {
  return (
    <main className="bg-[#0B0C10] text-white font-sans">
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] py-24 bg-gradient-to-b from-[#0B0C10] to-[#1A1C23]">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-2 mb-8 text-sm font-medium text-[#00AFFF] bg-[#00AFFF]/10 rounded-full">
              Next-Gen AI Solutions
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Transform Your Business with{' '}
              <span className="text-[#00AFFF]">AI Solutions</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Unlock the power of custom AI. We build, deploy, and support next-gen AI agents tailored to your business—fast, secure, and scalable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="#contact" 
                className="w-full sm:w-auto px-8 py-4 bg-[#00AFFF] text-white font-medium rounded-lg shadow-lg hover:bg-[#0090cc] transition-all duration-300"
              >
                Get Started
              </a>
              <a 
                href="#demo" 
                className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                Watch Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-16 bg-[#1A1C23]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#00AFFF] mb-2">98%</div>
              <div className="text-gray-300">Client Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#00AFFF] mb-2">500+</div>
              <div className="text-gray-300">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#00AFFF] mb-2">24/7</div>
              <div className="text-gray-300">Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#00AFFF] mb-2">99.9%</div>
              <div className="text-gray-300">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Agents Section */}
      <section className="w-full py-24 bg-[#0B0C10]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturedAgents />
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 bg-[#0B0C10]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-gray-300">
              Built for modern businesses that demand excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-8 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 mb-6 flex items-center justify-center">
                <Image src="/check-circle.svg" alt="Verified" width={48} height={48} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Agents</h3>
              <p className="text-gray-300 leading-relaxed">
                All agents are thoroughly tested and verified for quality and performance.
              </p>
            </div>
            
            <div className="p-8 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 mb-6 flex items-center justify-center">
                <Image src="/lightning.svg" alt="Fast" width={48} height={48} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Integration</h3>
              <p className="text-gray-300 leading-relaxed">
                Simple deployment process with comprehensive documentation and support.
              </p>
            </div>
            
            <div className="p-8 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 mb-6 flex items-center justify-center">
                <Image src="/globe.svg" alt="Global" width={48} height={48} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Driven</h3>
              <p className="text-gray-300 leading-relaxed">
                Join a growing community of developers and users sharing their experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-24 bg-[#1A1C23]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              What Our Clients Say
            </h2>
            <p className="text-gray-300">
              Trusted by leading companies worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="p-8 bg-white/5 rounded-xl">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 mr-4">
                  <Image src="/user-avatar.svg" alt="User" width={48} height={48} />
                </div>
                <div>
                  <div className="font-semibold">John Smith</div>
                  <div className="text-sm text-gray-400">CTO, TechCorp</div>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                "The AI solutions provided have transformed our business operations. The team's expertise and support are unmatched."
              </p>
            </div>

            <div className="p-8 bg-white/5 rounded-xl">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 mr-4">
                  <Image src="/user-avatar.svg" alt="User" width={48} height={48} />
                </div>
                <div>
                  <div className="font-semibold">Sarah Johnson</div>
                  <div className="text-sm text-gray-400">CEO, InnovateAI</div>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                "Implementing their AI solutions was seamless. The results exceeded our expectations and our ROI was achieved within months."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 bg-[#0B0C10]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of companies already using our AI solutions to drive growth and innovation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="#contact" 
                className="w-full sm:w-auto px-8 py-4 bg-[#00AFFF] text-white font-medium rounded-lg shadow-lg hover:bg-[#0090cc] transition-all duration-300"
              >
                Start Free Trial
              </a>
              <a 
                href="#demo" 
                className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                Schedule Demo
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
