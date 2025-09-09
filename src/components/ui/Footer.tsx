import Link from "next/link"
import { Bot, Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="glass-panel mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-neon">
                <Bot className="h-5 w-5 text-black" />
              </div>
              <span className="text-lg font-bold text-glow">Xeinst</span>
            </div>
            <p className="text-white/70 text-sm">
              The premier marketplace for AI agents. Connect, create, and monetize intelligent automation.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="https://github.com" 
                className="text-white/70 hover:text-cyan-400 transition-colors duration-200"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link 
                href="https://twitter.com" 
                className="text-white/70 hover:text-cyan-400 transition-colors duration-200"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link 
                href="https://linkedin.com" 
                className="text-white/70 hover:text-cyan-400 transition-colors duration-200"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Marketplace */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-glow-subtle">Marketplace</h3>
            <div className="space-y-2">
              <Link 
                href="/marketplace" 
                className="block text-white/70 hover:text-cyan-400 transition-colors duration-200 text-sm"
              >
                Browse Agents
              </Link>
              <Link 
                href="/upload" 
                className="block text-white/70 hover:text-cyan-400 transition-colors duration-200 text-sm"
              >
                Upload Agent
              </Link>
              <Link 
                href="/pricing" 
                className="block text-white/70 hover:text-cyan-400 transition-colors duration-200 text-sm"
              >
                Pricing
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-glow-subtle">Support</h3>
            <div className="space-y-2">
              <Link 
                href="/contact" 
                className="block text-white/70 hover:text-cyan-400 transition-colors duration-200 text-sm"
              >
                Contact Us
              </Link>
              <Link 
                href="/docs" 
                className="block text-white/70 hover:text-cyan-400 transition-colors duration-200 text-sm"
              >
                Documentation
              </Link>
              <Link 
                href="/help" 
                className="block text-white/70 hover:text-cyan-400 transition-colors duration-200 text-sm"
              >
                Help Center
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-glow-subtle">Legal</h3>
            <div className="space-y-2">
              <Link 
                href="/legal/terms" 
                className="block text-white/70 hover:text-cyan-400 transition-colors duration-200 text-sm"
              >
                Terms of Service
              </Link>
              <Link 
                href="/legal/privacy" 
                className="block text-white/70 hover:text-cyan-400 transition-colors duration-200 text-sm"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/legal/cookies" 
                className="block text-white/70 hover:text-cyan-400 transition-colors duration-200 text-sm"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-white/20 text-center">
          <p className="text-white/50 text-sm">
            © 2024 Xeinst. All rights reserved. Built with ❤️ for the AI community.
          </p>
        </div>
      </div>
    </footer>
  )
}